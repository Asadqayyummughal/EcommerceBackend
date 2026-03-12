import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { uploadCategory } from "../middlewares/multer";
import { createCategorySchema } from "../validators/category.validators";
import { validate } from "../middlewares/validate.middleware";
import * as categoryController from "../controllers/category-controller";
const router = Router();
router.post(
  "/",
  authMiddleware,
  uploadCategory.single("image"),
  validate(createCategorySchema),
  categoryController.createCategory
);

router.get("/", categoryController.listCategories);

router.get("/categories/:id", categoryController.getCategory);

router.put(
  "/categories/:id",
  authMiddleware,
  uploadCategory.single("image"),
  validate(createCategorySchema),
  categoryController.updateCategory
);

router.delete(
  "/categories/:id",
  authMiddleware,
  categoryController.deleteCategory
);

export default router;
