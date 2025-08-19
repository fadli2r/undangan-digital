import { withTimeout } from '../../lib/dbConnect';
import dbConnect from '../../lib/dbConnect';
import Admin from '../../models/Admin';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Testing admin authentication...');

    // Connect to database with timeout
    await withTimeout(dbConnect(), 5000);

    // Check if initial admin exists
    const admin = await withTimeout(
      Admin.findOne({ email: 'admin@undangandigital.com' }),
      3000
    );

    if (!admin) {
      // Create initial admin if it doesn't exist
      await withTimeout(Admin.createInitialAdmin(), 5000);
      console.log('Created initial admin user');
    }

    // Test database connection and admin model
    const adminCount = await withTimeout(
      Admin.countDocuments(),
      3000
    );

    return res.status(200).json({
      status: 'success',
      message: 'Admin authentication system is working',
      initialAdminExists: !!admin,
      totalAdmins: adminCount,
      defaultCredentials: {
        email: 'admin@undangandigital.com',
        password: 'admin123'
      }
    });

  } catch (error) {
    console.error('Admin auth test failed:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Admin authentication test failed',
      error: error.message
    });
  }
}
