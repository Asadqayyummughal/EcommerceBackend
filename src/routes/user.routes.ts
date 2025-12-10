import { Router } from "express";
import {
  getUsers,
  getProfileController,
  updateProfileController,
  changePasswordController,
  uploadImageController,
} from "../controllers/user.controllers";
import { authMiddleware } from "../middlewares/auth.middleware.";
import { uploadProfile } from "../middlewares/upload.middleware";

const router = Router();

router.get("/", getUsers);
router.get("/profile", getProfileController);
router.post("/updateProfile", updateProfileController);
router.post("/profile/changePassword", changePasswordController);
router.post(
  "/upload-image/:id",
  authMiddleware,
  uploadProfile.single("image"),
  uploadImageController
);

export default router;
