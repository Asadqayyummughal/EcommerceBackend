import Router from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import * as returnController from "../controllers/return.controller";
const router = Router();

router.post("/", authMiddleware, returnController.createReturn);
router.get("/", authMiddleware, returnController.getAllReturns);
router.put("/:id/approve", authMiddleware, returnController.approveReturn);
router.put("/:id/reject", authMiddleware, returnController.rejectReturn);
router.put("/:id/receive", authMiddleware, returnController.marReturnReceived);
router.put("/:id/refund", authMiddleware, returnController.refundReturn);

export default router;
