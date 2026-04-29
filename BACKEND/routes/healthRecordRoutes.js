import express from "express";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import {
  getMyHealthRecord, getPatientHealthRecord, updateVitals,
  addAllergy, removeAllergy, addMedicalCondition,
  resolveCondition, getHealthSummary,
} from "../controllers/healthRecordController.js";

const router = express.Router();

router.use(protect);

router.get("/me",                          getMyHealthRecord);
router.get("/me/summary",                  getHealthSummary);
router.patch("/me/vitals",                 updateVitals);
router.post("/me/allergy",                 addAllergy);
router.delete("/me/allergy/:allergyId",    removeAllergy);
router.post("/me/condition",               addMedicalCondition);
router.patch("/me/condition/:conditionId", resolveCondition);
router.get("/patient/:patientId",          restrictTo("doctor"), getPatientHealthRecord);

export default router;
