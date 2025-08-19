import dbConnect from '../../../lib/dbConnect';
import Admin from '../../../models/Admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@undangandigital.com' });
    
    if (existingAdmin) {
      return res.status(200).json({ 
        success: true, 
        message: 'Admin user already exists',
        admin: {
          email: existingAdmin.email,
          name: existingAdmin.name,
          role: existingAdmin.role,
          isActive: existingAdmin.isActive
        }
      });
    }

    // Create initial admin
    const admin = await Admin.create({
      name: 'Administrator',
      email: 'admin@undangandigital.com',
      password: 'admin123',
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

    console.log('Initial admin user created successfully');

    return res.status(201).json({ 
      success: true, 
      message: 'Initial admin user created successfully',
      admin: {
        email: admin.email,
        name: admin.name,
        role: admin.role,
        isActive: admin.isActive
      }
    });

  } catch (error) {
    console.error('Error creating initial admin:', error);
    return res.status(500).json({ 
      error: 'Failed to create initial admin',
      details: error.message
    });
  }
}
