import dbConnect from '../../../utils/db';
import Invitation from '../../../models/Invitation';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { slug, password } = req.body;

    if (!slug || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Slug and password are required' 
      });
    }

    // Find the invitation
    const invitation = await Invitation.findOne({ slug });

    if (!invitation) {
      return res.status(404).json({ 
        success: false, 
        error: 'Invitation not found' 
      });
    }

    // Check if invitation is password protected
    if (!invitation.privacy?.isPasswordProtected) {
      return res.status(400).json({ 
        success: false, 
        error: 'This invitation is not password protected' 
      });
    }

    // Verify password
    const isPasswordCorrect = invitation.privacy.password === password;

    if (!isPasswordCorrect) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid password' 
      });
    }

    // Password is correct
    return res.status(200).json({ 
      success: true,
      message: 'Password verified successfully'
    });

  } catch (error) {
    console.error('Error verifying password:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}
