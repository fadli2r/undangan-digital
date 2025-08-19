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
      // Update permissions if they don't exist
      if (!existingAdmin.permissions || existingAdmin.permissions.length === 0) {
        const allPermissions = [
          'dashboard.view',
          'users.view',
          'users.create',
          'users.edit',
          'users.delete',
          'packages.view',
          'packages.create',
          'packages.edit',
          'packages.delete',
          'invitations.view',
          'invitations.edit',
          'invitations.delete',
          'orders.view',
          'orders.edit',
          'settings.view',
          'settings.edit',
          'coupons.view',
          'coupons.create',
          'coupons.edit',
          'coupons.delete'
        ];
        
        existingAdmin.permissions = allPermissions;
        await existingAdmin.save();
        
        return res.status(200).json({ 
          message: 'Admin user permissions updated',
          admin: {
            email: existingAdmin.email,
            role: existingAdmin.role,
            permissions: existingAdmin.permissions
          }
        });
      }
      
      return res.status(200).json({ 
        message: 'Admin user already exists',
        admin: {
          email: existingAdmin.email,
          role: existingAdmin.role,
          permissions: existingAdmin.permissions
        }
      });
    }

    const allPermissions = [
      'dashboard.view',
      'users.view',
      'users.create',
      'users.edit',
      'users.delete',
      'packages.view',
      'packages.create',
      'packages.edit',
      'packages.delete',
      'invitations.view',
      'invitations.edit',
      'invitations.delete',
      'orders.view',
      'orders.edit',
      'settings.view',
      'settings.edit',
      'coupons.view',
      'coupons.create',
      'coupons.edit',
      'coupons.delete'
    ];

    // Create initial admin
    const admin = await Admin.create({
      name: 'Administrator',
      email: 'admin@undangandigital.com',
      password: 'admin123',
      role: 'superadmin',
      isActive: true,
      permissions: allPermissions
    });

    return res.status(201).json({
      message: 'Admin user created successfully',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      },
      credentials: {
        email: 'admin@undangandigital.com',
        password: 'admin123'
      }
    });

  } catch (error) {
    console.error('Error creating admin:', error);
    return res.status(500).json({ 
      error: 'Failed to create admin user',
      details: error.message 
    });
  }
}
