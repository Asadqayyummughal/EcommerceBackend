import { Router } from "express";
import {
  getProfileController,
  updateProfileController,
  changePasswordController,
  uploadImageController,
} from "../controllers/user.controllers";
import { authMiddleware } from "../middlewares/auth.middleware";
import { uploadUser } from "../middlewares/multer";
const router = Router();
router.get("/profile", authMiddleware, getProfileController);
router.post("/updateProfile", authMiddleware, updateProfileController);
router.post(
  "/profile/changePassword",
  authMiddleware,
  changePasswordController,
);
router.post(
  "/upload-image/:id",
  authMiddleware,
  uploadUser.single("image"),
  uploadImageController,
);

export default router;
