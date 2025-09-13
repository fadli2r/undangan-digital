// models/Purchase.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const PurchaseSchema = new Schema(
  {
    // Jenis entitlement
    kind: {
      type: String,
      enum: ["base", "addon"], // base = paket, addon = fitur tambahan
      default: "base",
      index: true,
    },

    // Cakupan entitlement
    scope: {
      type: String,
      enum: ["invitation", "account"], // untuk sekarang: "invitation"
      default: "invitation",
    },

    // Identitas user
    userId: { type: Schema.Types.ObjectId, ref: "User" }, // tadinya required, dibuat optional agar aman dengan data lama
    user_email: { type: String, lowercase: true, trim: true, index: true },

    // Relasi order / paket / undangan
    orderId: { type: Schema.Types.ObjectId, ref: "Order", index: true },
    packageId: { type: Schema.Types.ObjectId, ref: "Package" }, // tetap ada untuk base
    invitationId: { type: Schema.Types.ObjectId, ref: "Invitation" }, // untuk addon per undangan

    // Fitur yang diberi hak (untuk addon), juga dicatat requested-nya
    features: [{ type: String, lowercase: true, trim: true }],
    selectedFeatures: [{ type: String, lowercase: true, trim: true }],

    // Status entitlement
    status: {
      type: String,
      // tambahkan opsi lama supaya data existing tidak rusak
      enum: ["active", "used", "expired", "refunded", "canceled", "cancelled"],
      default: "active",
      index: true,
    },

    // Masa berlaku
    startsAt: { type: Date },
    expiresAt: { type: Date }, // sudah ada di skema lama, tetap dipakai

    // Catatan bebas
    notes: { type: String },
  },
  { timestamps: true }
);

// Index tambahan untuk query yang sering dipakai
PurchaseSchema.index({ user_email: 1, kind: 1 });
PurchaseSchema.index({ invitationId: 1, kind: 1 });

export default mongoose.models.Purchase || mongoose.model("Purchase", PurchaseSchema);
