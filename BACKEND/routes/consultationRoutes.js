import express from "express";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import {
  startConsultation, sendMessage, addPrescription,
  completeConsultation, cancelConsultation,
  getMyConsultations, getConsultationById,
} from "../controllers/consultationController.js";

const router = express.Router();

router.use(protect); 

router.post("/start",              restrictTo("patient"), startConsultation);
router.get("/my",                  getMyConsultations);
router.get("/:id",                 getConsultationById);
router.post("/:id/message",        sendMessage);
router.post("/:id/prescribe",      restrictTo("doctor"),  addPrescription);
router.patch("/:id/complete",      restrictTo("doctor"),  completeConsultation);
router.patch("/:id/cancel",        cancelConsultation);

export default router;
