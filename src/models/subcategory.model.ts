import mongoose, { Schema, Document } from "mongoose";

export interface ISubCategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  category: mongoose.Types.ObjectId;   // always the root Category (denormalized for fast lookup)
  parent?: mongoose.Types.ObjectId;    // ref to parent SubCategory (null = level-1)
  ancestors: mongoose.Types.ObjectId[]; // ordered path [level1Id, level2Id, ...] excluding self
  level: number;                        // 1–4
  isActive: boolean;
}

const SubCategorySchema = new Schema<ISubCategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String },
    image: { type: String },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    parent: { type: Schema.Types.ObjectId, ref: "SubCategory", default: null, index: true },
    ancestors: [{ type: Schema.Types.ObjectId, ref: "SubCategory" }],
    level: { type: Number, required: true, min: 1, max: 4 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<ISubCategory>("SubCategory", SubCategorySchema);
