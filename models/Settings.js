import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    general: {
      siteName: { type: String, default: "Dreamslink Invitation" },
      siteDescription: {
        type: String,
        default:
          "Platform undangan digital terbaik untuk pernikahan impian Anda",
      },
      contactEmail: { type: String, default: "contact@dreamslink.id" },
      supportPhone: { type: String, default: "+6281779900078" },
      whatsappNumber: { type: String, default: "+6281779900078" },
    },
    features: {
      allowRegistration: { type: Boolean, default: true },
      requireEmailVerification: { type: Boolean, default: true },
      enablePaymentGateway: { type: Boolean, default: true },
      enableSocialLogin: { type: Boolean, default: true },
    },
    limits: {
      maxInvitationsPerUser: { type: Number, default: 5 },
      maxGuestsPerInvitation: { type: Number, default: 500 },
      maxPhotosPerGallery: { type: Number, default: 20 },
    },
    payment: {
      xenditApiKey: { type: String, default: "" },
      xenditWebhookToken: { type: String, default: "" },
      enableSandbox: { type: Boolean, default: true },
    },
    email: {
      smtpHost: { type: String, default: "" },
      smtpPort: { type: Number, default: 587 },
      smtpUser: { type: String, default: "" },
      smtpPassword: { type: String, default: "" },
      fromEmail: { type: String, default: "" },
      fromName: { type: String, default: "Undangan Digital" },
    },
    social: {
      facebookUrl: { type: String, default: "" },
      instagramUrl: { type: String, default: "" },
      twitterUrl: { type: String, default: "" },
      youtubeUrl: { type: String, default: "" },
    },
    maintenance: {
      enabled: { type: Boolean, default: false },
      message: {
        type: String,
        default:
          "Website sedang dalam maintenance. Silakan coba lagi nanti.",
      },
    },
    seo: {
      metaTitle: {
        type: String,
        default: "Dreamslink - Platform Undangan Pernikahan Online",
      },
      metaDescription: {
        type: String,
        default:
          "Buat undangan pernikahan digital yang elegan dan modern. Template premium, mudah digunakan, dan dapat dibagikan secara online.",
      },
      metaKeywords: {
        type: String, // tetap string sesuai strukturmu sekarang
        default:
          "undangan digital, undangan pernikahan, wedding invitation, undangan online",
      },
    },
  },
  { timestamps: true }
);

/* ------------------------ Helpers ------------------------ */
function isPlainObject(v) {
  return !!v && typeof v === "object" && !Array.isArray(v);
}
function deepMerge(target, source) {
  if (!isPlainObject(source)) return target;
  const out = { ...target };
  for (const key of Object.keys(source)) {
    const sVal = source[key];
    const tVal = out[key];
    if (isPlainObject(sVal) && isPlainObject(tVal)) {
      out[key] = deepMerge(tVal, sVal);
    } else {
      out[key] = sVal;
    }
  }
  return out;
}

/* --------------------- Normalization --------------------- */
// Trim string fields softly
settingsSchema.pre("save", function nextSave(next) {
  try {
    const doc = this;
    const walk = (obj) => {
      if (!isPlainObject(obj)) return;
      for (const k of Object.keys(obj)) {
        const v = obj[k];
        if (typeof v === "string") obj[k] = v.trim();
        else if (isPlainObject(v)) walk(v);
      }
    };
    walk(doc);
    next();
  } catch (e) {
    next(e);
  }
});

/* --------------------- Public Projection --------------------- */
// Untuk endpoint publik (admin settings public)
settingsSchema.methods.toPublic = function () {
  const obj = this.toObject({ versionKey: false });
  // sembunyikan secrets
  if (obj.payment) {
    obj.payment = {
      ...obj.payment,
      xenditApiKey: obj.payment.xenditApiKey ? "********" : "",
      xenditWebhookToken: obj.payment.xenditWebhookToken ? "********" : "",
    };
  }
  if (obj.email) {
    obj.email = {
      ...obj.email,
      smtpPassword: obj.email.smtpPassword ? "********" : "",
    };
  }
  return obj;
};

/* --------------------- Static Methods --------------------- */
// Get singleton (create if not exists)
settingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) settings = await this.create({});
  return settings;
};

// Deep-merge update
settingsSchema.statics.updateSettings = async function (newSettings = {}) {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create(newSettings);
    return settings;
  }
  const merged = deepMerge(settings.toObject(), newSettings);
  settings.set(merged);
  await settings.save();
  return settings;
};

// (opsional) alias yang enak dibaca
settingsSchema.statics.getSingleton = settingsSchema.statics.getSettings;

/* --------------------- Export Model --------------------- */
export default mongoose.models.Settings ||
  mongoose.model("Settings", settingsSchema);
