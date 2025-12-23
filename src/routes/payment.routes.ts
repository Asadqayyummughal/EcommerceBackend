import { Router } from "express";
import * as paymentController from "../controllers/payment.controller";
const router = Router();
router.post("/create-intent", paymentController.createStripeIntent);
router.post("/confirm-payment", paymentController.confirmPayment);
export default router;
