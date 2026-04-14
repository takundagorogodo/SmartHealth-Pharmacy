import express from "express";
import consultationRoutes from "./consultationRoutes.js";
import healthRecordRoutes from "./healthRecordRoutes.js";


const router = express.Router();

router.use("/consultations",consultationRoutes);
router.use("/health-record",healthRecordRoutes);

export default router;