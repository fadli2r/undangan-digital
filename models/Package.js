import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    default: null // For showing discounts
  },
  currency: {
    type: String,
    default: 'IDR'
  },
  duration: {
    value: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      enum: ['days', 'months', 'years', 'lifetime'],
      required: true
    }
  },
  features: [{
    name: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    included: {
      type: Boolean,
      default: true
    },
    limit: {
      type: Number,
      default: null // null means unlimited
    }
  }],
  limits: {
    invitations: {
      type: Number,
      default: 1
    },
    guests: {
      type: Number,
      default: 100
    },
    photos: {
      type: Number,
      default: 10
    },
    templates: [{
      type: String
    }],
    customDomain: {
      type: Boolean,
      default: false
    },
    removeWatermark: {
      type: Boolean,
      default: false
    },
    analytics: {
      type: Boolean,
      default: false
    },
    priority_support: {
      type: Boolean,
      default: false
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  metadata: {
    color: {
      type: String,
      default: '#3B82F6'
    },
    icon: {
      type: String,
      default: '📦'
    },
    badge: {
      type: String,
      default: null // e.g., "Most Popular", "Best Value"
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
packageSchema.index({ isActive: 1, sortOrder: 1 });
packageSchema.index({ slug: 1 });

// Pre-save middleware to generate slug
packageSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Static method to get active packages
packageSchema.statics.getActivePackages = function() {
  return this.find({ isActive: true }).sort({ sortOrder: 1, createdAt: 1 });
};

// Static method to get featured packages
packageSchema.statics.getFeaturedPackages = function() {
  return this.find({ isActive: true, isFeatured: true }).sort({ sortOrder: 1 });
};

// Method to check if package includes a feature
packageSchema.methods.hasFeature = function(featureName) {
  return this.features.some(feature => 
    feature.name === featureName && feature.included
  );
};

// Method to get feature limit
packageSchema.methods.getFeatureLimit = function(featureName) {
  const feature = this.features.find(f => f.name === featureName);
  return feature ? feature.limit : null;
};

// Virtual for formatted price
packageSchema.virtual('formattedPrice').get(function() {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: this.currency
  }).format(this.price);
});

// Virtual for discount percentage
packageSchema.virtual('discountPercentage').get(function() {
  if (!this.originalPrice || this.originalPrice <= this.price) return 0;
  return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
});

// Ensure virtuals are included in JSON
packageSchema.set('toJSON', { virtuals: true });

export default mongoose.models.Package || mongoose.model('Package', packageSchema);
