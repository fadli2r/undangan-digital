import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'actorModel',
    required: false
  },
  actorModel: {
    type: String,
    required: true,
    enum: ['Admin', 'User']
  },
  action: {
    type: String,
    required: true,
    enum: [
      // User related
      'user.create', 'user.update', 'user.delete', 'user.block', 'user.unblock',
      'user.reset_password', 'user.reset_quota', 'users.view',
      
      // Invitation related
      'invitation.create', 'invitation.update', 'invitation.delete',
      'invitation.activate', 'invitation.deactivate', 'invitations.view',
      
      // Order related
      'order.create', 'order.update', 'order.delete',
      'payment.confirm', 'payment.reject', 'payment.refund',
      
      // Package related
      'package.create', 'package.update', 'package.delete',
      'promo.create', 'promo.update', 'promo.delete',
      
      // Content related
      'content.create', 'content.update', 'content.delete',
      'content.moderate', 'content.approve', 'content.reject',
      
      // Admin related
      'admin.create', 'admin.update', 'admin.delete',
      'admin.login', 'admin.logout', 'admin.failed_login',
      
      // Dashboard related
      'dashboard.view',
      
      // System related
      'system.settings_update', 'system.backup', 'system.restore',
      'system.maintenance_mode'
    ]
  },
  target: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'targetModel',
    required: false
  },
  targetModel: {
    type: String,
    required: false,
    enum: ['User', 'Invitation', 'Order', 'Package', 'Promo', 'Admin', null]
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  },
  ip: {
    type: String,
    required: false
  },
  userAgent: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'success'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for better query performance
activityLogSchema.index({ actor: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ target: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });

// Static method to log activity
activityLogSchema.statics.logActivity = async function({
  actor,
  actorModel = 'Admin',
  action,
  target = null,
  targetModel = null,
  details = null,
  ip = null,
  userAgent = null,
  status = 'success',
  metadata = {}
}) {
  try {
    return await this.create({
      actor,
      actorModel,
      action,
      target,
      targetModel,
      details,
      ip,
      userAgent,
      status,
      metadata
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    // If actor validation fails, try without actor
    try {
      return await this.create({
        actor: null,
        actorModel,
        action,
        target,
        targetModel,
        details: { 
          ...details, 
          originalActor: actor,
          error: 'Actor validation failed'
        },
        ip,
        userAgent,
        status: 'failed',
        metadata
      });
    } catch (secondError) {
      console.error('Failed to create activity log even without actor:', secondError);
      // Return null if we can't log at all
      return null;
    }
  }
};

// Method to get recent activity for a specific actor
activityLogSchema.statics.getRecentActivity = function(actorId, limit = 10) {
  return this.find({ actor: actorId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('actor')
    .populate('target');
};

// Method to get activity stats
activityLogSchema.statics.getActivityStats = async function(timeframe = '24h') {
  const now = new Date();
  let startDate;

  switch (timeframe) {
    case '24h':
      startDate = new Date(now - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now - 24 * 60 * 60 * 1000);
  }

  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 },
        successCount: {
          $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
        },
        failedCount: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        }
      }
    }
  ]);
};

export default mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);
