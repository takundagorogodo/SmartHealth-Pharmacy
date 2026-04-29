import express from "express";
import { register , login, getMe ,changePassword, deleteUser, updateUser} from "../controllers/userControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register",register);
router.post("/login",login);

router.get("/me", protect, getMe);
router.patch("/change-password", protect, changePassword);

router.put("/delete",protect,deleteUser);
router.put("/update",protect,updateUser);


export default router;