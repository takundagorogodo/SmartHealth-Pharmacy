import { GoogleGenerativeAI } from "@google/generative-ai";
import HealthRecord from "../models/healthRecord.js";
import Consultation from "../models/consultantModel.js";

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); 
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

  const prompt = `
    You are a medical AI assistant for SmartPharmacy.
    Always consider the patient's medical history when analysing symptoms.
    Never suggest medications the patient is allergic to.
    Flag if current symptoms match a recurring pattern.
    
    Always respond in this exact JSON format:
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
    }

    ${patientContext}

    CURRENT SYMPTOMS REPORTED:
    - Symptoms: ${symptoms.join(", ")}
    - Description: ${description}

    Analyse and provide possible diagnoses and medication suggestions.
    Take the full patient history into account.
  `;

 
  const model = client.getGenerativeModel({
    model: "gemini-1.5-flash", 
  });

  const result = await model.generateContent(prompt);
  const rawText = result.response.text();

  
  const cleaned = rawText
    .replace(/```json/g, "")  
    .replace(/```/g, "")
    .trim();

  const parsed = JSON.parse(cleaned);
  return parsed; 
};