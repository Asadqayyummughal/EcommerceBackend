import { Router } from "express";
import {
  getUsers,
  getProfileController,
  updateProfileController,
  changePasswordController,
  uploadImageController,
} from "../controllers/user.controllers";
import { authMiddleware } from "../middlewares/auth.middleware";
import { uploadProfile } from "../middlewares/upload.middleware";

const router = Router();

router.get("/", authMiddleware, getUsers);
router.get("/profile", authMiddleware, getProfileController);
router.post("/updateProfile", authMiddleware, updateProfileController);
router.post(
  "/profile/changePassword",
  authMiddleware,
  changePasswordController
);
router.post(
  "/upload-image/:id",
  authMiddleware,
  uploadProfile.single("image"),
  uploadImageController
);

export default router;
