import { Router } from "express";
import {
  getUsers,
  createUser,
  getProfile,
} from "../controllers/user.controllers";

const router = Router();

router.get("/", getUsers);
router.post("/", createUser);
router.get("/profile", getProfile);

export default router;
