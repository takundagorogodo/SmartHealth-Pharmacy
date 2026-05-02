// services/aiSymptomChecker.js
import Groq from "groq-sdk";
import HealthRecord from "../models/healthRecord.js";
import Consultation from "../models/consultantModel.js";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const analyseSymptoms = async (patientId, symptoms, description) => {

  const healthRecord = await HealthRecord.findOne({ patient: patientId })
    .populate("pastConsultations")
    .populate("currentMedications.prescribedBy");

  const recentConsultations = await Consultation.find({ patient: patientId })
    .sort({ createdAt: -1 })
    .limit(5)
    .select("symptoms aiAnalysis.diagnoses prescription createdAt");

  const patientContext = `
    PATIENT MEDICAL HISTORY:
    - Blood group: ${healthRecord?.bloodGroup || "unknown"}
    - Known conditions: ${healthRecord?.medicalHistory?.map(m => m.condition).join(", ") || "none"}
    - Known allergies: ${healthRecord?.allergies?.map(a => `${a.substance} (${a.severity})`).join(", ") || "none"}
    - Current medications: ${healthRecord?.currentMedications?.map(m => `${m.medication} ${m.dosage}`).join(", ") || "none"}
    - Recurring symptoms: ${healthRecord?.recurringSymptoms?.map(r => `${r.symptom} (${r.occurrences}x)`).join(", ") || "none"}

    RECENT CONSULTATIONS (last 5):
    ${recentConsultations.map((c, i) => `
      ${i + 1}. Date: ${c.createdAt.toDateString()}
         Symptoms: ${c.symptoms.join(", ")}
         Diagnosed: ${c.aiAnalysis?.diagnoses?.map(d => d.name).join(", ") || "N/A"}
    `).join("")}
  `;

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile", // ✅ free and very capable
    messages: [
      {
        role: "system",
        content: `You are a medical AI assistant for SmartPharmacy.
                  Always consider the patient's medical history when analysing symptoms.
                  Never suggest medications the patient is allergic to.
                  Flag if current symptoms match a recurring pattern.
                  
                  Always respond ONLY in this exact JSON format with no extra text:
                  {
                    "diagnoses": [
                      {
                        "name": "condition name",
                        "probability": "high | medium | low",
                        "description": "brief explanation",
                        "suggestedMedications": ["med1", "med2"]
                      }
                    ],
                    "summary": "brief overall summary for the patient",
                    "recurringAlert": "null or message if symptoms are recurring",
                    "seekUrgentCare": true or false
                  }`,
      },
      {
        role: "user",
        content: `
          ${patientContext}

          CURRENT SYMPTOMS REPORTED:
          - Symptoms: ${symptoms.join(", ")}
          - Description: ${description}

          Analyse and provide possible diagnoses and medication suggestions.
          Take the full patient history into account.
        `,
      },
    ],
    temperature: 0.7,
    max_tokens: 1024,
  });

  // parse the JSON response
  const rawText = response.choices[0].message.content;
  const cleaned = rawText
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const parsed = JSON.parse(cleaned);
  return parsed;
};