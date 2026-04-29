import mongoose from "mongoose";

const consultationSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor", // ✅ FIXED (matches your DB)
      required: true,
    },

    symptoms: [
      {
        type: String,
        trim: true,
      },
    ],

    symptomDescription: {
      type: String,
      trim: true,
    },

    painLevel: {
      type: Number,
      min: 1,
      max: 10,
    },

    durationDays: {
      type: Number,
      min: 1,
    },

    aiAnalysis: {
      diagnoses: [
        {
          name: String,
          probability: String,
          description: String,
          suggestedMedication: [String],
        },
      ],
      generatedAt: {
        type: Date,
        default: Date.now,
      },
    },

    doctorNotes: {
      type: String,
      trim: true,
    },

    prescription: [
      {
        medication: String,
        dosage: String,
        frequency: String,
        durationDays: Number,
      },
    ],

    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        senderRole: {
          type: String,
          enum: ["patient", "doctor", "ai"],
        },
        text: {
          type: String,
          trim: true,
        },
        sentAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    status: {
      type: String,
      enum: ["ongoing", "completed", "cancelled"],
      default: "ongoing",
    },

    resolvedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Consultation = mongoose.model("Consultation", consultationSchema);

export default Consultation;