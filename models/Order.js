import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: true
  },
  harga: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'cancelled', 'expired'],
    default: 'pending'
  },
  invoice_id: String,         // ID dari Xendit
  external_id: String,        // external_id yang kamu generate
  invoice_url: String,        // Link pembayaran Xendit
  paid_at: Date,              // Tanggal dibayar
  created_at: {
    type: Date,
    default: Date.now
  },
  used: {
    type: Boolean,
    default: false
  },
  invitation_slug: {
    type: String,
    default: null
  },
  notes: String,
  payment_method: String      // optional: 'qris', 'va', 'ewallet', dll
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
