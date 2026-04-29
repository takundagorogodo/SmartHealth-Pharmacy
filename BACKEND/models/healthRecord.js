
import mongoose from "mongoose";

const healthRecordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,  
    },

    medicalHistory: [
      {
        condition: String,       
        diagnosedAt: Date,
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],

    
    allergies: [
      {
        substance: String,       
        reaction: String,        
        severity: {
          type: String,
          enum: ["mild", "moderate", "severe"],
        },
      },
    ],

    pastConsultations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Consultation",
      },
    ],


    recurringSymptoms: [
      {
        symptom: String,         
         occurrences: Number,     
        lastReported: Date,
      },
    ],

    currentMedications: [
      {
        medication: String,
        dosage: String,
        prescribedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Doctor",
        },
        startDate: Date,
        endDate: Date,
      },
    ],

    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },

    weight: Number,   
    height: Number,   
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("HealthRecord", healthRecordSchema);