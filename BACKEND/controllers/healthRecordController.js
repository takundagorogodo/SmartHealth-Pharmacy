import HealthRecord from "../models/healthRecord.js";
import Consultation from "../models/consultantModel.js";


export const getMyHealthRecord = async (req, res) => {
  try {
    const patientId = req.user._id;

    let record = await HealthRecord.findOne({ patient: patientId })
      .populate("pastConsultations", "symptoms status createdAt aiAnalysis.diagnoses")
      .populate("currentMedications.prescribedBy", "specialization")
      .populate({ 
        path: "currentMedications.prescribedBy",
        populate: { path: "user", select: "name surname" }
      });

    if (!record) {
      record = await HealthRecord.create({ patient: patientId });
    }

    return res.status(200).json({ healthRecord: record });
  } catch (error) {
    console.error("getMyHealthRecord error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const getPatientHealthRecord = async (req, res) => {
  try {
    const { patientId } = req.params;
    const doctorUserId = req.user._id;

    const hasConsultation = await Consultation.findOne({
      patient: patientId,
      status: { $in: ["ongoing", "completed"] },
    }).populate("doctor");

    const isDoctorAssigned = hasConsultation?.doctor?.user?.toString() === doctorUserId.toString();
    if (!isDoctorAssigned) {
      return res.status(403).json({
        message: "Access denied — you have no consultation with this patient",
      });
    }

    const record = await HealthRecord.findOne({ patient: patientId })
      .populate("pastConsultations", "symptoms status createdAt prescription")
      .populate("currentMedications.prescribedBy");

    if (!record) {
      return res.status(404).json({ message: "No health record found for this patient" });
    }

    return res.status(200).json({ healthRecord: record });
  } catch (error) {
    console.error("getPatientHealthRecord error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const updateVitals = async (req, res) => {
  try {
    const patientId = req.user._id;
    const { bloodGroup, weight, height } = req.body;

    const record = await HealthRecord.findOneAndUpdate(
      { patient: patientId },
      { $set: { bloodGroup, weight, height } },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      message: "Vitals updated successfully",
      healthRecord: record,
    });
  } catch (error) {
    console.error("updateVitals error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const addAllergy = async (req, res) => {
  try {
    const patientId = req.user._id;
    const { substance, reaction, severity } = req.body;

    const existing = await HealthRecord.findOne({
      patient: patientId,
      "allergies.substance": { $regex: new RegExp(`^${substance}$`, "i") },
    });
    if (existing) {
      return res.status(400).json({ message: `Allergy to ${substance} already recorded` });
    }

    const record = await HealthRecord.findOneAndUpdate(
      { patient: patientId },
      { $push: { allergies: { substance, reaction, severity } } },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      message: "Allergy added successfully",
      allergies: record.allergies,
    });
  } catch (error) {
    console.error("addAllergy error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const removeAllergy = async (req, res) => {
  try {
    const patientId = req.user._id;
    const { allergyId } = req.params;

    const record = await HealthRecord.findOneAndUpdate(
      { patient: patientId },
      { $pull: { allergies: { _id: allergyId } } },
      { new: true }
    );

    return res.status(200).json({
      message: "Allergy removed",
      allergies: record.allergies,
    });
  } catch (error) {
    console.error("removeAllergy error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const addMedicalCondition = async (req, res) => {

  try {

    const patientId = req.user._id;
    const { condition, diagnosedAt } = req.body;

    const record = await HealthRecord.findOneAndUpdate(
      { patient: patientId },
      {
        $push: {
          medicalHistory: {
            condition,
            diagnosedAt: diagnosedAt || new Date(),
            isActive: true,
          },
        },
      },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      message: "Medical condition added",
      medicalHistory: record.medicalHistory,
    });
  } catch (error) {
    console.error("addMedicalCondition error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const resolveCondition = async (req, res) => {
  try {
    const patientId = req.user._id;
    const { conditionId } = req.params;

    const record = await HealthRecord.findOneAndUpdate(
      { patient: patientId, "medicalHistory._id": conditionId },
      { $set: { "medicalHistory.$.isActive": false } },
      { new: true }
    );

    return res.status(200).json({
      message: "Condition marked as resolved",
      medicalHistory: record.medicalHistory,
    });
  } catch (error) {
    console.error("resolveCondition error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getHealthSummary = async (req, res) => {
  try {
        
        const patientId = req.user._id;

        const record = await HealthRecord.findOne({ patient: patientId });
        const totalConsultations = await Consultation.countDocuments({ patient: patientId });
        const ongoingConsultations = await Consultation.countDocuments({
        patient: patientId,
        status: "ongoing",
        });

        return res.status(200).json({
        summary: {
            bloodGroup: record?.bloodGroup || "Not set",
            weight: record?.weight || null,
            height: record?.height || null,
            activeConditions: record?.medicalHistory.filter((m) => m.isActive).length || 0,
            knownAllergies: record?.allergies.length || 0,
            currentMedications: record?.currentMedications.length || 0,
            recurringSymptoms: record?.recurringSymptoms.length || 0,
            totalConsultations,
            ongoingConsultations,
        },
    });
  } catch (error) {
    console.error("getHealthSummary error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};