import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  minimumAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  maximumDiscount: {
    type: Number,
    min: 0
  },
  usageLimit: {
    type: Number,
    min: 1
  },
  usageCount: {
    type: Number,
    default: 0,
    min: 0
  },
  userUsageLimit: {
    type: Number,
    default: 1,
    min: 1
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applicablePackages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package'
  }],
  excludedPackages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  usageHistory: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    discountAmount: {
      type: Number,
      required: true
    },
    usedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index untuk performa
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
couponSchema.index({ createdBy: 1 });

// Virtual untuk status
couponSchema.virtual('status').get(function() {
  const now = new Date();
  
  if (!this.isActive) return 'inactive';
  if (now < this.startDate) return 'scheduled';
  if (now > this.endDate) return 'expired';
  if (this.usageLimit && this.usageCount >= this.usageLimit) return 'exhausted';
  
  return 'active';
});

// Virtual untuk usage percentage
couponSchema.virtual('usagePercentage').get(function() {
  if (!this.usageLimit) return 0;
  return Math.round((this.usageCount / this.usageLimit) * 100);
});

// Method untuk validasi kupon
couponSchema.methods.isValidForUser = function(userId, packageId, orderAmount) {
  const now = new Date();
  
  // Check if coupon is active
  if (!this.isActive) return { valid: false, reason: 'Kupon tidak aktif' };
  
  // Check date range
  if (now < this.startDate) return { valid: false, reason: 'Kupon belum berlaku' };
  if (now > this.endDate) return { valid: false, reason: 'Kupon sudah kadaluarsa' };
  
  // Check usage limit
  if (this.usageLimit && this.usageCount >= this.usageLimit) {
    return { valid: false, reason: 'Kupon sudah habis digunakan' };
  }
  
  // Check minimum amount
  if (orderAmount < this.minimumAmount) {
    return { valid: false, reason: `Minimum pembelian Rp ${this.minimumAmount.toLocaleString()}` };
  }
  
  // Check user usage limit
  const userUsage = this.usageHistory.filter(usage => 
    usage.user && usage.user.toString() === userId.toString()
  ).length;
  
  if (userUsage >= this.userUsageLimit) {
    return { valid: false, reason: 'Anda sudah mencapai batas penggunaan kupon ini' };
  }
  
  // Check applicable packages
  if (this.applicablePackages.length > 0) {
    const isApplicable = this.applicablePackages.some(pkg => 
      pkg.toString() === packageId.toString()
    );
    if (!isApplicable) {
      return { valid: false, reason: 'Kupon tidak berlaku untuk paket ini' };
    }
  }
  
  // Check excluded packages
  if (this.excludedPackages.length > 0) {
    const isExcluded = this.excludedPackages.some(pkg => 
      pkg.toString() === packageId.toString()
    );
    if (isExcluded) {
      return { valid: false, reason: 'Kupon tidak berlaku untuk paket ini' };
    }
  }
  
  return { valid: true };
};

// Method untuk menghitung diskon
couponSchema.methods.calculateDiscount = function(amount) {
  let discount = 0;
  
  if (this.type === 'percentage') {
    discount = (amount * this.value) / 100;
    if (this.maximumDiscount && discount > this.maximumDiscount) {
      discount = this.maximumDiscount;
    }
  } else if (this.type === 'fixed') {
    discount = Math.min(this.value, amount);
  }
  
  return Math.round(discount);
};

// Method untuk menggunakan kupon
couponSchema.methods.useCoupon = function(userId, orderId, discountAmount) {
  this.usageCount += 1;
  this.usageHistory.push({
    user: userId,
    order: orderId,
    discountAmount: discountAmount,
    usedAt: new Date()
  });
  
  return this.save();
};

// Pre-save middleware untuk validasi
couponSchema.pre('save', function(next) {
  // Validate date range
  if (this.endDate <= this.startDate) {
    return next(new Error('Tanggal berakhir harus setelah tanggal mulai'));
  }
  
  // Validate percentage value
  if (this.type === 'percentage' && this.value > 100) {
    return next(new Error('Persentase diskon tidak boleh lebih dari 100%'));
  }
  
  // Validate maximum discount for percentage type
  if (this.type === 'percentage' && this.maximumDiscount && this.maximumDiscount <= 0) {
    return next(new Error('Maksimum diskon harus lebih dari 0'));
  }
  
  next();
});

// Ensure virtual fields are serialized
couponSchema.set('toJSON', { virtuals: true });
couponSchema.set('toObject', { virtuals: true });

export default mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);
