import Consultation from "../models/consultantModel.js";
import DoctorProfile from "../models/doctorodels.js";
import HealthRecord from "../models/healthRecord.js";
import { analyseSymptoms } from "../services/aiSymptomChecker.js";

export const startConsultation = async (req, res) => {
  try {
    const { doctorId, symptoms, symptomDescription, painLevel, durationDays } = req.body;
    const patientId = req.user._id; 

    
    const doctor = await DoctorProfile.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    if (!doctor.isVerified) {
      return res.status(403).json({ message: "Doctor is not verified yet" });
    }

    const existing = await Consultation.findOne({
      patient: patientId,
      doctor: doctorId,
      status: "ongoing",
    });
    if (existing) {
      return res.status(400).json({
        message: "You already have an ongoing consultation with this doctor",
        consultationId: existing._id,
      });
    }

    // 3. Run AI symptom analysis (injects patient history internally)
    const aiResult = await analyseSymptoms(patientId, symptoms, symptomDescription);

    const consultation = await Consultation.create({
      patient: patientId,
      doctor: doctorId,
      symptoms,
      symptomDescription,
      painLevel,
      durationDays,
      aiAnalysis: {
        diagnoses: aiResult.diagnoses,
        generatedAt: new Date(),
      },
      messages: [
        {
          senderRole: "ai",
          text: aiResult.summary,
          sentAt: new Date(),
        },
      ],
    });

    await HealthRecord.findOneAndUpdate(
      { patient: patientId },
      {
        $push: {
          pastConsultations: consultation._id,
          ...symptoms.reduce((acc, symptom) => {
            acc["recurringSymptoms"] = {
              $each: [{ symptom, occurrences: 1, lastReported: new Date() }],
            };
            return acc;
          }, {}),
        },
      },
      { upsert: true } 
    );

    return res.status(201).json({
      message: "Consultation started successfully",
      consultation,
    });
  } catch (error) {
    console.error("startConsultation error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const senderId = req.user._id;
    const senderRole = req.user.role; 

    const consultation = await Consultation.findById(id);
    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }
    if (consultation.status !== "ongoing") {
      return res.status(400).json({ message: "This consultation is no longer active" });
    }

    const isPatient = consultation.patient.toString() === senderId.toString();
    const isDoctor = consultation.doctor.toString() === senderId.toString();
    if (!isPatient && !isDoctor) {
      return res.status(403).json({ message: "You are not part of this consultation" });
    }

    const newMessage = {
      sender: senderId,
      senderRole,
      text,
      sentAt: new Date(),
    };

    consultation.messages.push(newMessage);
    await consultation.save();

    return res.status(200).json({
      message: "Message sent",
      newMessage,
    });
  } catch (error) {
    console.error("sendMessage error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const addPrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { doctorNotes, prescription } = req.body;
    const doctorUserId = req.user._id;

   const consultation = await Consultation.findById(id).populate("doctor");
    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    if (consultation.doctor.user.toString() !== doctorUserId.toString()) {
      return res.status(403).json({ message: "Only the assigned doctor can prescribe" });
    }

    consultation.doctorNotes = doctorNotes;
    consultation.prescription = prescription;
    await consultation.save();

    await HealthRecord.findOneAndUpdate(
      { patient: consultation.patient },
      {
        $push: {
          currentMedications: {
            $each: prescription.map((p) => ({
              medication: p.medication,
              dosage: p.dosage,
              prescribedBy: consultation.doctor._id,
              startDate: new Date(),
              endDate: new Date(Date.now() + p.durationDays * 24 * 60 * 60 * 1000),
            })),
          },
        },
      }
    );

    return res.status(200).json({
      message: "Prescription added successfully",
      consultation,
    });
  } catch (error) {
    console.error("addPrescription error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const completeConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorUserId = req.user._id;

    const consultation = await Consultation.findById(id).populate("doctor");
    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }
    if (consultation.doctor.user.toString() !== doctorUserId.toString()) {
      return res.status(403).json({ message: "Only the assigned doctor can complete this" });
    }
    if (consultation.status === "completed") {
      return res.status(400).json({ message: "Consultation is already completed" });
    }

   
    consultation.status = "completed";
    consultation.resolvedAt = new Date();
    await consultation.save();

    await DoctorProfile.findByIdAndUpdate(consultation.doctor._id, {
      $inc: { totalPatientsHelped: 1 },
      $addToSet: { uniquePatients: consultation.patient },
    });

    return res.status(200).json({
      message: "Consultation completed successfully",
      consultation,
    });
  } catch (error) {
    console.error("completeConsultation error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const cancelConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const consultation = await Consultation.findById(id).populate("doctor");
    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    const isPatient = consultation.patient.toString() === userId.toString();
    const isDoctor = consultation.doctor.user.toString() === userId.toString();
    if (!isPatient && !isDoctor) {
      return res.status(403).json({ message: "Not authorized to cancel this consultation" });
    }
    if (consultation.status !== "ongoing") {
      return res.status(400).json({ message: "Only ongoing consultations can be cancelled" });
    }

    consultation.status = "cancelled";
    await consultation.save();

    return res.status(200).json({ message: "Consultation cancelled", consultation });
  } catch (error) {
    console.error("cancelConsultation error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getMyConsultations = async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;
    const { status, page = 1, limit = 10 } = req.query;

    const filter = role === "patient"
      ? { patient: userId }
      : { doctor: userId };

    if (status) filter.status = status;

    const consultations = await Consultation.find(filter)
      .populate("patient", "name surname email")
      .populate({ path: "doctor", populate: { path: "user", select: "name surname" } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Consultation.countDocuments(filter);

    return res.status(200).json({
      consultations,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("getMyConsultations error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const getConsultationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const consultation = await Consultation.findById(id)
      .populate("patient", "name surname email age gender")
      .populate({ path: "doctor", populate: { path: "user", select: "name surname" } })
      .populate("messages.sender", "name role");

    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    const isPatient = consultation.patient._id.toString() === userId.toString();
    const isDoctor = consultation.doctor.user._id.toString() === userId.toString();
    if (!isPatient && !isDoctor) {
      return res.status(403).json({ message: "Access denied" });
    }

    return res.status(200).json({ consultation });
  } catch (error) {
    console.error("getConsultationById error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};