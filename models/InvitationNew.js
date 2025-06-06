import mongoose from 'mongoose';

const InvitationSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  mempelai: {
    pria: { type: String, required: true },
    wanita: { type: String, required: true },
    foto_pria: { type: String },
    foto_wanita: { type: String },
    orangtua_pria: { type: String },
    orangtua_wanita: { type: String }
  },
  acara: [{
    nama: String,
    tanggal: Date,
    waktu: String,
    lokasi: String,
    alamat: String,
    maps_link: String
  }],
  acara_utama: {
    tanggal: Date
  },
  galeri: [String],
  our_story: [{
    tahun: String,
    cerita: String,
    foto: String
  }],
  gift: {
    enabled: { type: Boolean, default: false },
    description: String,
    bank_accounts: [{
      bank: String,
      nomor: String,
      atas_nama: String,
      logo: String
    }],
    e_wallets: [{
      nama: String,
      nomor: String,
      qr_code: String,
      logo: String
    }],
    qris: {
      enabled: { type: Boolean, default: false },
      merchant_name: String,
      image_url: String
    }
  },
  tambahan: {
    musik: String,
    maps_url: String,
    guestName: String,
    qr_code_url: String,
    instagram: String,
    whatsapp: String,
    instagram_pria: String,
    instagram_wanita: String,
    credit: String,
    live_streaming: {
      enabled: Boolean,
      url: String,
      platform: String
    }
  },
  privacy: {
    isPasswordProtected: {
      type: Boolean,
      default: false
    },
    password: {
      type: String,
      default: ''
    },
    hideGuestbook: {
      type: Boolean,
      default: false
    },
    hideRSVP: {
      type: Boolean,
      default: false
    }
  }
}, { timestamps: true });

export default mongoose.models.Invitation || mongoose.model('Invitation', InvitationSchema);
