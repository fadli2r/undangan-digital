import mongoose from "mongoose";

const TemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    thumbnail: { type: String, default: "" },
    category: { type: String, default: "" },
    price: { type: Number, default: 0 },
    isPremium: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// ✅ Safe check untuk hot-reload di Next.js
const Template =
  (mongoose.models && mongoose.models.Template) ||
  mongoose.model("Template", TemplateSchema);

export default Template;
