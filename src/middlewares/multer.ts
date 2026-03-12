import multer from "multer";
import path from "path";
import fs from "fs";

type UploadContext = "products" | "store" | "users" | "categories";

const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".jfif"];

const SIZE_LIMITS: Record<UploadContext, number> = {
  products: 5 * 1024 * 1024, // 5 MB
  store: 5 * 1024 * 1024, // 5 MB
  users: 2 * 1024 * 1024, // 2 MB
  categories: 2 * 1024 * 1024, // 2 MB
};

function createUpload(context: UploadContext) {
  const dir = path.join(process.cwd(), "uploads", context);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const name = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
      cb(null, name);
    },
  });

  return multer({
    storage,
    limits: { fileSize: SIZE_LIMITS[context] },
    fileFilter: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return cb(
          new Error(
            `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`,
          ),
        );
      }
      cb(null, true);
    },
  });
}

export const uploadProduct = createUpload("products");
export const uploadStore = createUpload("store");
export const uploadUser = createUpload("users");
export const uploadCategory = createUpload("categories");

// Legacy alias — remove once all routes are migrated
export const uploadMiddleware = uploadProduct;
