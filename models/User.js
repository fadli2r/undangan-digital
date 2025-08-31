// models/User.js
import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const UserSchema = new mongoose.Schema({
  // Data utama
  email: { type: String, required: true, unique: true, index: true },
  name:  { type: String, required: true },
  password: { 
    type: String, 
    required: function() { return !this.isOAuthUser; } 
  },
  phone: { type: String, default: "" },

  // OAuth user flag
  isOAuthUser: { type: Boolean, default: false },

  // Status & verifikasi
  isVerified: { type: Boolean, default: false },
  isActive:   { type: Boolean, default: true },

  // Onboarding
  onboardingCompleted: { type: Boolean, default: false },
  onboardingStep:      { type: Number, default: 1 },

  // ✅ Quota untuk membuat undangan
  quota: { type: Number, default: 0 },

  // (Opsional) kalau mau tetap menyimpan field lama, bisa hapus ini biar tidak bingung
  // hasCompletedOnboarding: { type: Boolean, default: false },

  // Subscription & Package
  currentPackage: {
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' },
    startDate: Date,
    endDate:   Date,
    isActive:  { type: Boolean, default: true }
  },

  hasSelectedPackage: { type: Boolean, default: false },

  // Purchase History
  purchases: [{
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' },
    orderId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    amount:    Number,
    purchaseDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled', 'refunded'],
      default: 'pending'
    },
    paymentMethod: String,
    notes: String
  }],

  // Invitations created
  invitations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Invitation' }],

  // Source tracking
  source: {
    type: String,
    enum: ['website', 'whatsapp', 'admin', 'other'],
    default: 'website'
  },

  // Admin notes
  adminNotes: { type: String, default: "" },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Virtuals
UserSchema.virtual('totalPurchases').get(function() {
  return this.purchases.reduce((total, p) => total + (p.status === 'completed' ? p.amount : 0), 0);
});
UserSchema.virtual('activeInvitationsCount').get(function() {
  return this.invitations.length;
});

// Methods
UserSchema.methods.hasActiveSubscription = function() {
  if (!this.currentPackage) return false;
  const now = new Date();
  return this.currentPackage.isActive && this.currentPackage.endDate > now;
};
UserSchema.methods.hashPassword = async function(password) {
  const salt = await bcryptjs.genSalt(12);
  return bcryptjs.hash(password, salt);
};
UserSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcryptjs.compare(candidatePassword, this.password);
};

// Middleware
UserSchema.pre('save', async function(next) {
  this.updatedAt = new Date();
  if (this.isModified('password') && this.password && !this.isOAuthUser) {
    try {
      this.password = await this.hashPassword(this.password);
    } catch (err) { return next(err); }
  }
  next();
});

UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

// Hindari OverwriteModelError di Next.js
export default mongoose.models.User || mongoose.model("User", UserSchema);
