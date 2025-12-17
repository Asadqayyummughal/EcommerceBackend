import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { uploadMiddleware } from "../middlewares/multer";
import {
  createCategorySchema,
  createSubCategorySchema,
} from "../validators/category.validators";
import { validate } from "../middlewares/validate.middleware";
import * as subCategoryController from "../controllers/subcategory.controller";
const router = Router();
router.post(
  "/",
  authMiddleware,
  uploadMiddleware.single("image"),
  validate(createSubCategorySchema),
  subCategoryController.createSubCategory
);
router.get("/", subCategoryController.listSubCategories);
router.get("/:id", subCategoryController.getSubCategory);
router.put(
  "/:id",
  authMiddleware,
  uploadMiddleware.single("image"),
  validate(createCategorySchema),
  subCategoryController.updateSubCategory
);

router.delete("/:id", authMiddleware, subCategoryController.deleteSubCategory);

export default router;
