import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  email: String,
  paket: String,
  harga: Number,
  status: String,
  invoice_id: String,
  date: Date,
  used: { type: Boolean, default: false },
  invitation_slug: { type: String, default: null }
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
