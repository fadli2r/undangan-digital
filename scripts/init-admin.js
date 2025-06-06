import mongoose from 'mongoose';
import Admin from '../models/Admin.js';

async function initializeAdmin() {
  try {
    const mongoUri = process.argv[2] || 'mongodb://localhost:27017/undangan-digital';
    console.log('Connecting to database...');
    await mongoose.connect(mongoUri);
    console.log('Database connected successfully');

    console.log('Creating initial admin user...');
    await Admin.createInitialAdmin();
    
    // Verify the admin was created
    const admin = await Admin.findOne({ email: 'admin@undangandigital.com' });
    if (admin) {
      console.log('Admin user created successfully:');
      console.log('Email: admin@undangandigital.com');
      console.log('Password: admin123');
      console.log('Role:', admin.role);
      console.log('Permissions:', admin.permissions);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error initializing admin:', error);
    process.exit(1);
  }
}

initializeAdmin();
