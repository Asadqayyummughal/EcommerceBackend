import { Request, Response, NextFunction } from "express";
import Joi from "joi";

export const validate =
  (schema: Joi.ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    // Multipart FormData fields arrive as strings — coerce before Joi validation
    const body = { ...req.body };
    if (typeof body.variants === 'string') {
      try { body.variants = JSON.parse(body.variants); } catch { body.variants = []; }
    }
    if (typeof body.tags === 'string') {
      body.tags = body.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
    }
    if (typeof body.isActive === 'string') {
      body.isActive = body.isActive === 'true';
    }
    const { error } = schema.validate(body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }
    req.body = body;
    next();
  };
