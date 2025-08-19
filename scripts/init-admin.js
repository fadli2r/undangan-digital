const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define Admin schema
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
    type: String
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

const Admin = mongoose.model('Admin', adminSchema);

async function initializeAdmin() {
  try {
    // Use MongoDB Atlas URI directly
    const mongoUri = 'mongodb+srv://fadli2r:fadli2r@cluster0.aqxgwxm.mongodb.net/undangan-digital?retryWrites=true&w=majority';

    console.log('Connecting to database...');
    await mongoose.connect(mongoUri);
    console.log('Database connected successfully');

    console.log('Creating initial admin user...');
    const existingAdmin = await Admin.findOne({ email: 'admin@undangandigital.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists:');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      process.exit(0);
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create new admin
    const admin = await Admin.create({
      name: 'Administrator',
      email: 'admin@undangandigital.com',
      password: hashedPassword,
      role: 'superadmin',
      isActive: true,
      permissions: [
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
    });

    console.log('Admin user created successfully:');
    console.log('Email: admin@undangandigital.com');
    console.log('Password: admin123');
    console.log('Role:', admin.role);

    process.exit(0);
  } catch (error) {
    console.error('Error initializing admin:', error);
    process.exit(1);
  }
}

initializeAdmin();
