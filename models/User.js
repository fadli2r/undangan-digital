import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const UserSchema = new mongoose.Schema({
  // Data utama
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  password: { 
    type: String, 
    required: function() {
      // Password required only if not using OAuth
      return !this.isOAuthUser;
    }
  },
  phone: {
    type: String,
    default: ""
  },
  
  // OAuth user flag
  isOAuthUser: {
    type: Boolean,
    default: false
  },
  
  // Status dan verifikasi
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },

  // Subscription & Package
  currentPackage: {
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package'
    },
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  },

  // Purchase History
  purchases: [{
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package'
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    amount: Number,
    purchaseDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled', 'refunded'],
      default: 'pending'
    },
    paymentMethod: String,
    notes: String
  }],

  // Invitations created
  invitations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invitation'
  }],

  // Source tracking
  source: {
    type: String,
    enum: ['website', 'whatsapp', 'admin', 'other'],
    default: 'website'
  },
  
  // Admin notes
  adminNotes: {
    type: String,
    default: ""
  },

  // Timestamps
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Virtual untuk total pembelian
UserSchema.virtual('totalPurchases').get(function() {
  return this.purchases.reduce((total, purchase) => {
    return total + (purchase.status === 'completed' ? purchase.amount : 0);
  }, 0);
});

// Virtual untuk jumlah undangan aktif
UserSchema.virtual('activeInvitationsCount').get(function() {
  return this.invitations.length;
});

// Method untuk cek status subscription
UserSchema.methods.hasActiveSubscription = function() {
  if (!this.currentPackage) return false;
  
  const now = new Date();
  return this.currentPackage.isActive && 
         this.currentPackage.endDate > now;
};

// Method untuk hash password
UserSchema.methods.hashPassword = async function(password) {
  const salt = await bcryptjs.genSalt(12);
  return await bcryptjs.hash(password, salt);
};

// Method untuk compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcryptjs.compare(candidatePassword, this.password);
};

// Middleware untuk hash password sebelum save
UserSchema.pre('save', async function(next) {
  this.updatedAt = new Date();
  
  // Hash password jika dimodifikasi dan bukan OAuth user
  if (this.isModified('password') && this.password && !this.isOAuthUser) {
    try {
      this.password = await this.hashPassword(this.password);
    } catch (error) {
      return next(error);
    }
  }
  
  next();
});

UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
