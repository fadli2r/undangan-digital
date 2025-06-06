import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  general: {
    siteName: {
      type: String,
      default: 'Undangan Digital'
    },
    siteDescription: {
      type: String,
      default: 'Platform undangan digital terbaik untuk pernikahan impian Anda'
    },
    contactEmail: {
      type: String,
      default: 'contact@undangandigital.com'
    },
    supportPhone: {
      type: String,
      default: '+62812345678'
    },
    whatsappNumber: {
      type: String,
      default: '+62812345678'
    }
  },
  features: {
    allowRegistration: {
      type: Boolean,
      default: true
    },
    requireEmailVerification: {
      type: Boolean,
      default: true
    },
    enablePaymentGateway: {
      type: Boolean,
      default: true
    },
    enableSocialLogin: {
      type: Boolean,
      default: true
    }
  },
  limits: {
    maxInvitationsPerUser: {
      type: Number,
      default: 5
    },
    maxGuestsPerInvitation: {
      type: Number,
      default: 500
    },
    maxPhotosPerGallery: {
      type: Number,
      default: 20
    }
  },
  payment: {
    xenditApiKey: {
      type: String,
      default: ''
    },
    xenditWebhookToken: {
      type: String,
      default: ''
    },
    enableSandbox: {
      type: Boolean,
      default: true
    }
  },
  email: {
    smtpHost: {
      type: String,
      default: ''
    },
    smtpPort: {
      type: Number,
      default: 587
    },
    smtpUser: {
      type: String,
      default: ''
    },
    smtpPassword: {
      type: String,
      default: ''
    },
    fromEmail: {
      type: String,
      default: ''
    },
    fromName: {
      type: String,
      default: 'Undangan Digital'
    }
  },
  social: {
    facebookUrl: {
      type: String,
      default: ''
    },
    instagramUrl: {
      type: String,
      default: ''
    },
    twitterUrl: {
      type: String,
      default: ''
    },
    youtubeUrl: {
      type: String,
      default: ''
    }
  },
  maintenance: {
    enabled: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      default: 'Website sedang dalam maintenance. Silakan coba lagi nanti.'
    }
  },
  seo: {
    metaTitle: {
      type: String,
      default: 'Undangan Digital - Platform Undangan Pernikahan Online'
    },
    metaDescription: {
      type: String,
      default: 'Buat undangan pernikahan digital yang elegan dan modern. Template premium, mudah digunakan, dan dapat dibagikan secara online.'
    },
    metaKeywords: {
      type: String,
      default: 'undangan digital, undangan pernikahan, wedding invitation, undangan online'
    }
  }
}, {
  timestamps: true
});

// Static method to get settings (create if not exists)
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

// Static method to update settings
settingsSchema.statics.updateSettings = async function(newSettings) {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create(newSettings);
  } else {
    // Deep merge the settings
    Object.keys(newSettings).forEach(key => {
      if (typeof newSettings[key] === 'object' && !Array.isArray(newSettings[key])) {
        settings[key] = { ...settings[key], ...newSettings[key] };
      } else {
        settings[key] = newSettings[key];
      }
    });
    await settings.save();
  }
  return settings;
};

export default mongoose.models.Settings || mongoose.model('Settings', settingsSchema);
