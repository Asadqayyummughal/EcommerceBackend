import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import * as usersController from "../controollers/users.controller";

const router = Router();
router.get("/", authMiddleware, usersController.getUsers); //must add admin only middle ware

export default router;
