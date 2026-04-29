import express from "express";
import consultationRoutes from "./consultationRoutes.js";
import healthRecordRoutes from "./healthRecordRoutes.js";
import authRoutes from "./authRoutes.js"

const router = express.Router();

router.use("/consultations",consultationRoutes);
router.use("/health-record",healthRecordRoutes);

router.use("/auth",authRoutes);

export default router;