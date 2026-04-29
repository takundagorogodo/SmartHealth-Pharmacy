import mongoose from "mongoose";
import Consultation from "../models/consultantModel.js";
import Doctor from "../models/doctorModels.js";
import HealthRecord from "../models/healthRecord.js";
import { analyseSymptoms } from "../services/aiSymptomChecker.js";


// ✅ START CONSULTATION
export const startConsultation = async (req, res) => {
  try {
    const { doctorId, symptoms, symptomDescription, painLevel, durationDays } = req.body;
    const patientId = req.user._id;

    const doctor = await Doctor.findById(doctorId);
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

    // ✅ FIXED recurringSymptoms push
    await HealthRecord.findOneAndUpdate(
      { patient: patientId },
      {
        $push: {
          pastConsultations: consultation._id,
          recurringSymptoms: {
            $each: symptoms.map((symptom) => ({
              symptom,
              occurrences: 1,
              lastReported: new Date(),
            })),
          },
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


// ✅ SEND MESSAGE
export const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const senderId = req.user._id;

    const consultation = await Consultation.findById(id).populate("doctor");
    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    if (consultation.status !== "ongoing") {
      return res.status(400).json({ message: "This consultation is no longer active" });
    }

    const isPatient = consultation.patient.toString() === senderId.toString();
    const isDoctor = consultation.doctor.user.toString() === senderId.toString();

    if (!isPatient && !isDoctor) {
      return res.status(403).json({ message: "You are not part of this consultation" });
    }

    const newMessage = {
      sender: senderId,
      senderRole: req.user.role,
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


// ✅ ADD PRESCRIPTION
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
              endDate: new Date(Date.now() + p.durationDays * 86400000),
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


// ✅ COMPLETE CONSULTATION
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
      return res.status(400).json({ message: "Consultation already completed" });
    }

    consultation.status = "completed";
    consultation.resolvedAt = new Date();
    await consultation.save();

    await Doctor.findByIdAndUpdate(consultation.doctor._id, {
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


// ✅ CANCEL CONSULTATION
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
      return res.status(403).json({ message: "Not authorized" });
    }

    if (consultation.status !== "ongoing") {
      return res.status(400).json({ message: "Only ongoing consultations can be cancelled" });
    }

    consultation.status = "cancelled";
    await consultation.save();

    return res.status(200).json({
      message: "Consultation cancelled",
      consultation,
    });
  } catch (error) {
    console.error("cancelConsultation error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


// ✅ GET MY CONSULTATIONS
export const getMyConsultations = async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;

    let filter = {};

    if (role === "patient") {
      filter.patient = userId;
    } else {
      const doctorProfile = await Doctor.findOne({ user: userId });
      if (!doctorProfile) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }
      filter.doctor = doctorProfile._id;
    }

    const consultations = await Consultation.find(filter)
      .populate("patient", "name surname email")
      .populate({ path: "doctor", populate: { path: "user", select: "name surname" } })
      .sort({ createdAt: -1 });

    return res.status(200).json({ consultations });
  } catch (error) {
    console.error("getMyConsultations error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


// ✅ GET CONSULTATION BY ID
export const getConsultationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const consultation = await Consultation.findById(id)
      .populate("patient", "name surname email")
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