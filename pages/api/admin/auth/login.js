import jwt from 'jsonwebtoken';
import dbConnect from '../../../../lib/dbConnect';
import Admin from '../../../../models/Admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Create initial admin if it doesn't exist
    await Admin.createInitialAdmin();

    // Find admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase(), isActive: true });
    
    if (!admin) {
      console.log(`Failed login attempt: ${email} - Admin not found`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // For initial setup, allow hardcoded password, otherwise use bcrypt comparison
    let isValidPassword = false;
    if (password === 'admin123' && admin.email === 'admin@undangandigital.com') {
      isValidPassword = true;
    } else {
      isValidPassword = await admin.comparePassword(password);
    }

    if (!isValidPassword) {
      console.log(`Failed login attempt: ${email} - Invalid password`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    admin.lastLogin = new Date();
    admin.loginHistory.push({
      timestamp: new Date(),
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });
    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        sub: admin._id.toString(),
        email: admin.email,
        role: admin.role,
        isAdmin: true,
        permissions: admin.permissions
      },
      process.env.NEXTAUTH_SECRET || 'fallback-secret',
      { expiresIn: '1d' }
    );

    console.log(`Successful admin login: ${email}`);

    // Return success with token and admin info
    return res.status(200).json({
      token,
      admin: {
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        lastLogin: admin.lastLogin
      }
    });

  } catch (error) {
    console.error('Admin Login Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
