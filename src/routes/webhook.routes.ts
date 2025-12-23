import { Router } from "express";
import express from "express";
import cors from "cors";
import { stripeWebhook } from "../controllers/webhook.controller";
const exprss = express();
const router = Router();

router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhook
);
export default router;
