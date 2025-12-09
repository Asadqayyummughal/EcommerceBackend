import { Router } from "express";
import {
  getUsers,
  getProfile,
  getProfileController,
  updateProfileController,
  changePasswordController,
} from "../controllers/user.controllers";

const router = Router();

router.get("/", getUsers);
// router.get('/profile', authenticate, getProfileController);
// router.put('/profile', authenticate, validateBody(updateProfileSchema), updateProfileController);
// router.put('/profile/password', authenticate, validateBody(changePasswordSchema), changePasswordController);

export default router;
