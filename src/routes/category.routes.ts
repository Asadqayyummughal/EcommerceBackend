import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { uploadMiddleware } from "../middlewares/multer";
import { createCategorySchema } from "../validators/category.validators";
import { validate } from "../middlewares/validate.middleware";
import * as categoryController from "../controllers/category-controller";
const router = Router();
router.post(
  "/",
  authMiddleware,
  uploadMiddleware.single("image"),
  validate(createCategorySchema),
  categoryController.createCategory
);

router.get("/", categoryController.listCategories);

router.get("/categories/:id", categoryController.getCategory);

router.put(
  "/categories/:id",
  authMiddleware,
  uploadMiddleware.single("image"),
  validate(createCategorySchema),
  categoryController.updateCategory
);

router.delete(
  "/categories/:id",
  authMiddleware,
  categoryController.deleteCategory
);

export default router;
