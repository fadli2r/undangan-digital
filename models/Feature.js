// models/Feature.js
import mongoose from "mongoose";

const FeatureSchema = new mongoose.Schema({
  // Identitas
  name: { type: String, required: true, trim: true },
  key:  { type: String, required: true, unique: true, lowercase: true, trim: true },

  // Deskripsi & harga (untuk add-on atau katalog)
  description: { type: String, default: "" },
  price: { type: Number, default: 0, min: 0 },

  // Urutan tampilan
  sort: { type: Number, default: 0 },

  // Status
  active: { type: Boolean, default: true },

  // Penagihan
  billing: {
    type: {
      type: String,
      enum: ["one_time", "recurring"],
      default: "one_time"
    },
    interval: { type: String, default: null } // ex: monthly, yearly
  },

  // Meta UI
  meta: {
    icon:  { type: String, default: "✨" },
    badge: { type: String, default: "" }
  }
}, { timestamps: true });

FeatureSchema.index({ active: 1, sort: 1 });

export default mongoose.models.Feature || mongoose.model("Feature", FeatureSchema);
