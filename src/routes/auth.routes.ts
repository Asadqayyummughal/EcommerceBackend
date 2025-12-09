import { Router } from "express";
import {
  signup,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller";
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/auth.validator";
import { validate } from "../middlewares/validate.middleware";

const router = Router();

router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.get("/refreshToken", refreshToken);
router.post("/logout", logout);
router.post("/forgotPassword", validate(forgotPasswordSchema), forgotPassword);
router.post(
  "/resetPassword/:token",
  validate(resetPasswordSchema),
  resetPassword
);

export default router;
