// models/Order.js
import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  type: { type: String, enum: ["package", "feature"], required: true },
  refId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  key: { type: String },
  name: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  qty: { type: Number, default: 1 },
  meta: { type: Object, default: {} },
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  // Identitas user
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  // simpan juga user_email untuk kompat lama/baru dan pengecekan ownership
  user_email: { type: String, lowercase: true, trim: true, index: true },

  // Paket
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Package",
    required: true,
    index: true
  },

  // Ringkasan item & jumlah slot undangan
  quantity: { type: Number, default: 1, min: 1 },
  items: [orderItemSchema],

  // Total pembayaran (IDR)
  amount: { type: Number },
  harga: { type: Number },
  currency: { type: String, default: "IDR" },

  // Status pembayaran
  status: {
    type: String,
    enum: ["pending", "paid", "canceled", "cancelled", "expired"],
    default: "pending",
    index: true
  },
  paidAt: { type: Date },
  paid_at: { type: Date },

  // Xendit (legacy)
  invoice_id: String,
  external_id: String,
  invoice_url: String,
  payment_method: String,

  // Xendit (baru)
  xendit: {
    invoiceId: { type: String, index: true },
    externalId: { type: String, index: true },
    invoiceUrl: String,
    payerEmail: String,
    paymentChannel: String,
    history: { type: Array, default: [] },
  },

  // Pilihan fitur custom
  selectedFeatures: { type: [String], default: [] },

  // Expiry invoice
  expiresAt: { type: Date, default: null },

  // Konsumsi order -> undangan
  used: { type: Boolean, default: false },
  invitation_slug: { type: String, default: null },

  // Misc
  notes: String,

  // >>> Tambahan penting <<<
  meta: { type: Object, default: {} },          // <-- inilah yang dibutuhkan webhook
  successPath: { type: String, default: null },  // supaya ikut tersimpan

  // Legacy + timestamps modern
  created_at: { type: Date, default: Date.now },
}, { timestamps: true });

// Index bantu
OrderSchema.index({ userId: 1, status: 1, createdAt: -1 });
OrderSchema.index({ email: 1, createdAt: -1 });

// Normalisasi & kompat
function normKeys(arr) {
  if (!Array.isArray(arr)) return [];
  return Array.from(new Set(arr.map(k => String(k || "").toLowerCase().trim()).filter(Boolean)));
}

OrderSchema.pre("validate", function(next) {
  if (this.status === "cancelled") this.status = "canceled";

  if (this.amount == null && this.harga != null) this.amount = this.harga;
  if (this.harga == null && this.amount != null) this.harga = this.amount;

  if (!this.paidAt && this.paid_at) this.paidAt = this.paid_at;
  if (!this.paid_at && this.paidAt) this.paid_at = this.paidAt;

  if (this.isModified("selectedFeatures")) {
    this.selectedFeatures = normKeys(this.selectedFeatures);
  }

  // selaraskan user_email bila kosong
  if (!this.user_email && this.email) {
    this.user_email = this.email;
  }

  next();
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
