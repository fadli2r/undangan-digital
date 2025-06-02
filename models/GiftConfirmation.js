import mongoose from "mongoose";

const GiftConfirmationSchema = new mongoose.Schema({
  slug: { type: String, required: true }, // slug undangan
  nama: { type: String, required: true },
  metode: { type: String, required: true }, // bank/ewallet/qris
  nominal: { type: Number, required: true },
  pesan: { type: String, default: "" },
  waktu: { type: Date, default: Date.now },
});

export default mongoose.models.GiftConfirmation || mongoose.model("GiftConfirmation", GiftConfirmationSchema);
