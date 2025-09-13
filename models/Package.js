// models/Package.js
import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  // ===== BASIC INFO =====
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, required: true },

  // ===== PRICING =====
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, default: null },
  currency: { type: String, default: 'IDR' },

  // ===== DURATION =====
  duration: {
    value: { type: Number, required: true },
    unit: { type: String, enum: ['days', 'months', 'years', 'lifetime'], required: true }
  },

  // ===== LEGACY FEATURES DETAIL (untuk landing/marketing) =====
  features: [{
    name: { type: String, required: true },
    description: { type: String },
    included: { type: Boolean, default: true },
    limit: { type: Number, default: null } // null = unlimited
  }],

  // ===== LIMITS =====
  limits: {
    invitations: { type: Number, default: 1 },
    guests: { type: Number, default: 100 },
    photos: { type: Number, default: 10 },
    templates: [{ type: String }],
    customDomain: { type: Boolean, default: false },
    removeWatermark: { type: Boolean, default: false },
    analytics: { type: Boolean, default: false },
    priority_support: { type: Boolean, default: false }
  },

  // ===== TYPE & FEATURE KEYS (gating teknis) =====
  type: { type: String, enum: ['fixed', 'custom'], default: 'fixed' },

  /**
   * featureKeys = daftar key fitur yang AKTIF by default untuk paket ini.
   * - fixed: wajib aktif & tidak bisa dihapus.
   * - custom: default bawaan (boleh kosong).
   */
  featureKeys: { type: [String], default: [] },

  /**
   * selectableFeatures = daftar key fitur yang boleh dipilih user di paket custom.
   * Kosong = semua fitur di katalog boleh dipilih.
   */
  selectableFeatures: { type: [String], default: [] },

  // ===== FLAGS =====
  isActive: { type: Boolean, default: true },
  isPopular: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },

  // ===== UI METADATA =====
  metadata: {
    color: { type: String, default: '#3B82F6' },
    icon: { type: String, default: '📦' },
    badge: { type: String, default: null }
  }
}, { timestamps: true });

// Index
packageSchema.index({ isActive: 1, sortOrder: 1 });

// Normalisasi slug jika kosong saat ganti name
packageSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Normalisasi & dedupe feature keys (lowercase) biar konsisten
function normalizeKeys(arr) {
  if (!Array.isArray(arr)) return [];
  return Array.from(new Set(arr.map(k =>
    String(k || '').toLowerCase().trim()
  ).filter(Boolean)));
}

packageSchema.pre('validate', function(next) {
  if (this.isModified('featureKeys')) {
    this.featureKeys = normalizeKeys(this.featureKeys);
  }
  if (this.isModified('selectableFeatures')) {
    this.selectableFeatures = normalizeKeys(this.selectableFeatures);
  }
  next();
});

// ===== Helpers =====
packageSchema.methods.hasFeatureKey = function(key) {
  return (this.featureKeys || []).includes(String(key).toLowerCase());
};
packageSchema.methods.getPresetFeatureKeys = function() {
  return Array.from(new Set(this.featureKeys || []));
};

// ===== Statics =====
packageSchema.statics.getActivePackages = function() {
  return this.find({ isActive: true }).sort({ sortOrder: 1, createdAt: 1 });
};
packageSchema.statics.getFeaturedPackages = function() {
  return this.find({ isActive: true, isFeatured: true }).sort({ sortOrder: 1 });
};

// ===== Virtuals =====
packageSchema.virtual('formattedPrice').get(function() {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: this.currency }).format(this.price);
});
packageSchema.virtual('discountPercentage').get(function() {
  if (!this.originalPrice || this.originalPrice <= this.price) return 0;
  return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
});
packageSchema.set('toJSON', { virtuals: true });

export default mongoose.models.Package || mongoose.model('Package', packageSchema);
