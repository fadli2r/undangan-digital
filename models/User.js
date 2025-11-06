// models/User.js
import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    // Data utama
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    name: { type: String, required: true, trim: true },
    password: {
      type: String,
      required: function () {
        return !this.isOAuthUser;
      },
      // NOTE: tidak dibuat select:false supaya sederhana.
      // Kalau nanti mau select:false, pastikan authorize pakai .select('+password')
    },
    phone: { type: String, default: "" },

    // OAuth user flag
    isOAuthUser: { type: Boolean, default: false },

    // Status & verifikasi
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // Onboarding
    onboardingCompleted: { type: Boolean, default: false },
    onboardingStep: { type: Number, default: 1 },

    // ✅ Quota
    quota: { type: Number, default: 0 },

    // Subscription & Package
    currentPackage: {
      packageId: { type: mongoose.Schema.Types.ObjectId, ref: "Package" },
      startDate: Date,
      endDate: Date,
      isActive: { type: Boolean, default: true },
    },

    hasSelectedPackage: { type: Boolean, default: false },

    // Purchase History
    purchases: [
      {
        packageId: { type: mongoose.Schema.Types.ObjectId, ref: "Package" },
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
        amount: Number,
        purchaseDate: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ["pending", "completed", "cancelled", "refunded"],
          default: "pending",
        },
        paymentMethod: String,
        notes: String,
      },
    ],

    // Invitations created
    invitations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Invitation" }],

    // Source tracking
    source: {
      type: String,
      enum: ["website", "whatsapp", "admin", "other"],
      default: "website",
    },

    // Admin notes
    adminNotes: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

// Virtuals
UserSchema.virtual("totalPurchases").get(function () {
  return this.purchases.reduce(
    (total, p) => total + (p.status === "completed" ? p.amount : 0),
    0
  );
});
UserSchema.virtual("activeInvitationsCount").get(function () {
  return this.invitations.length;
});

// Methods
UserSchema.methods.hasActiveSubscription = function () {
  if (!this.currentPackage) return false;
  const now = new Date();
  return this.currentPackage.isActive && this.currentPackage.endDate > now;
};

UserSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcryptjs.compare(candidatePassword, this.password);
};

// Middleware: anti double-hash
UserSchema.pre("save", async function (next) {
  try {
    this.updatedAt = new Date();

    // Normalisasi email
    if (this.isModified("email") && this.email) {
      this.email = this.email.toLowerCase().trim();
    }

    // Hash password hanya jika:
    // - field 'password' berubah
    // - ada nilainya
    // - user bukan OAuth
    // - dan BELUM dalam format bcrypt ($2a/$2b/$2y)
    if (this.isModified("password") && this.password && !this.isOAuthUser) {
      const looksHashed = typeof this.password === "string" && this.password.startsWith("$2");
      if (!looksHashed) {
        const salt = await bcryptjs.genSalt(12);
        this.password = await bcryptjs.hash(this.password, salt);
      }
    }

    next();
  } catch (err) {
    next(err);
  }
});

// Hide password in outputs
UserSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    delete ret.password;
    return ret;
  },
});
UserSchema.set("toObject", {
  virtuals: true,
  transform: (_, ret) => {
    delete ret.password;
    return ret;
  },
});

// Hindari OverwriteModelError
export default mongoose.models.User || mongoose.model("User", UserSchema);
