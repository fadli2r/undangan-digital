import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['superadmin', 'admin', 'support', 'moderator'],
    default: 'admin'
  },
  permissions: [{
    type: String,
    enum: [
      'dashboard.view',
      'users.view', 'users.edit', 'users.delete',
      'invitations.view', 'invitations.edit', 'invitations.delete',
      'orders.view', 'orders.edit', 'orders.delete',
      'packages.view', 'packages.edit', 'packages.delete',
      'analytics.view',
      'settings.view', 'settings.edit',
      'admins.view', 'admins.edit', 'admins.delete',
      'content.view', 'content.edit', 'content.delete'
    ]
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  loginHistory: [{
    timestamp: { type: Date, default: Date.now },
    ip: String,
    userAgent: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Default permissions by role
adminSchema.pre('save', function(next) {
  if (this.isNew && this.permissions.length === 0) {
    switch (this.role) {
      case 'superadmin':
        this.permissions = [
          'dashboard.view',
          'users.view', 'users.edit', 'users.delete',
          'invitations.view', 'invitations.edit', 'invitations.delete',
          'orders.view', 'orders.edit', 'orders.delete',
          'packages.view', 'packages.edit', 'packages.delete',
          'analytics.view',
          'settings.view', 'settings.edit',
          'admins.view', 'admins.edit', 'admins.delete',
          'content.view', 'content.edit', 'content.delete'
        ];
        break;
      case 'admin':
        this.permissions = [
          'dashboard.view',
          'users.view', 'users.edit',
          'invitations.view', 'invitations.edit',
          'orders.view', 'orders.edit',
          'packages.view',
          'analytics.view',
          'content.view', 'content.edit'
        ];
        break;
      case 'support':
        this.permissions = [
          'dashboard.view',
          'users.view', 'users.edit',
          'invitations.view',
          'orders.view',
          'content.view'
        ];
        break;
      case 'moderator':
        this.permissions = [
          'dashboard.view',
          'invitations.view',
          'content.view', 'content.edit', 'content.delete'
        ];
        break;
    }
  }
  next();
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Compare password method
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Static method to create initial admin
adminSchema.statics.createInitialAdmin = async function() {
  try {
    const existingAdmin = await this.findOne({ email: 'admin@undangandigital.com' });
    if (!existingAdmin) {
      await this.create({
        name: 'Administrator',
        email: 'admin@undangandigital.com',
        password: 'admin123',
        role: 'superadmin',
        isActive: true
      });
      console.log('Initial admin user created successfully');
    }
  } catch (error) {
    console.error('Error creating initial admin:', error);
  }
};

export default mongoose.models.Admin || mongoose.model('Admin', adminSchema);
