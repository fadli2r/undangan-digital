import dbConnect from '../../../../utils/db';
import Invitation from '../../../../models/Invitation';

export default async function handler(req, res) {
  const { slug } = req.query;

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { privacy } = req.body;

    if (!privacy) {
      return res.status(400).json({ 
        success: false, 
        error: 'Privacy settings are required' 
      });
    }

    // Validate privacy settings
    const validatedPrivacy = {
      isPasswordProtected: Boolean(privacy.isPasswordProtected),
      password: privacy.isPasswordProtected ? String(privacy.password || '') : '',
      hideGuestbook: Boolean(privacy.hideGuestbook),
      hideRSVP: Boolean(privacy.hideRSVP)
    };

    // If password protection is enabled, password is required
    if (validatedPrivacy.isPasswordProtected && !validatedPrivacy.password.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Password is required when password protection is enabled' 
      });
    }

    // Update the invitation
    const updatedInvitation = await Invitation.findOneAndUpdate(
      { slug },
      { 
        $set: { 
          privacy: validatedPrivacy 
        } 
      },
      { 
        new: true,
        upsert: false
      }
    );

    if (!updatedInvitation) {
      return res.status(404).json({ 
        success: false, 
        error: 'Invitation not found' 
      });
    }

    return res.status(200).json({ 
      success: true,
      message: 'Privacy settings updated successfully',
      privacy: updatedInvitation.privacy
    });

  } catch (error) {
    console.error('Error updating privacy settings:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}
