import mongoose from "mongoose";

const RSVPItem = new mongoose.Schema({
  nama: String,
  status: String, // "Hadir", "Tidak Hadir", "Ragu-ragu"
  jumlah: { type: Number, default: 1 },
  waktu: { type: Date, default: Date.now }
}, { _id: false });

const UcapanItem = new mongoose.Schema({
  nama: String,
  pesan: String,
  waktu: { type: Date, default: Date.now }
}, { _id: false });

const AcaraItem = new mongoose.Schema({
  nama: String,       // Nama acara, misal "Akad", "Resepsi"
  tanggal: Date,
  waktu: String,
  lokasi: String,
  alamat: String
}, { _id: false });

const InvitationSchema = new mongoose.Schema({
  // Data utama
  user_email: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  custom_slug: { type: String, default: "" }, // Custom slug yang bisa diatur user
  template: { type: String, required: true },

  // Data mempelai
  mempelai: {
    pria: String,
    wanita: String,
    foto_pria: String,
    foto_wanita: String,
    orangtua_pria: String,
    orangtua_wanita: String,
  },

  // Multi-acara:
  acara: [AcaraItem],       // array of acara (akad, resepsi, dsb.)
  acara_utama: {           // Acara utama (untuk tanggal inti)
    nama: String,
    tanggal: Date,
    waktu: String,
    lokasi: String,
    alamat: String
  },

  // Galeri foto (array link/gambar)
  galeri: [String],         // Array of url gambar
  main_photo: { type: String, default: "" },      // Foto utama
  background_photo: { type: String, default: "" }, // Foto background

  // Informasi tambahan
  tambahan: {
    catatan: { type: String, default: "" },
    dresscode: {
      baju: { type: String, default: "#000000" },
      celana: { type: String, default: "#000000" }
    },
    maps_url: { type: String, default: "" },
    protokol: { type: String, default: "" },
    musik: {
      enabled: { type: Boolean, default: false },
      url: { type: String, default: "" },      // URL to audio file or YouTube/Spotify
      type: { type: String, default: "file" }, // "file", "youtube", or "spotify"
      autoplay: { type: Boolean, default: true }
    },
    live_streaming: {
      enabled: { type: Boolean, default: false },
      youtube_url: { type: String, default: "" }
    },
    instagram_pria: { type: String, default: "" },
    instagram_wanita: { type: String, default: "" }
  },
  
  // Our Story section
  our_story: {
    main_photo: { type: String, default: "" },
    title: { type: String, default: "" },
    stories: [{
      heading: String,
      content: String
    }]
  },

  // Digital Gift / Amplop Digital
  gift: {
    enabled: { type: Boolean, default: false },
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
      image_url: String,
      merchant_name: String
    },
    konfirmasi: [{
      nama: String,
      nominal: Number,
      bank: String,
      pesan: String,
      waktu: { type: Date, default: Date.now }
    }]
  },

  // Privacy settings
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
  },

  // RSVP & Guestbook
  rsvp: [RSVPItem],
  ucapan: [UcapanItem],

  // Tamu undangan (opsional)
  tamu: [{
    nama: String,
    email: String,
    kode: String,   // kode unik untuk link khusus
  }],

  // Stats & Tracking
  views: { type: Number, default: 0 },
  lastViewed: { type: Date },

  // Attendance tracking
  attendance: [{
    name: String,
    timestamp: { type: Date, default: Date.now }
  }],

  // Tanggal dibuat/diedit
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Virtual property to check if invitation is expired (older than 1 year)
InvitationSchema.virtual('isExpired').get(function() {
  if (!this.createdAt) return false;
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  return this.createdAt < oneYearAgo;
});

InvitationSchema.set('toJSON', { virtuals: true });
InvitationSchema.set('toObject', { virtuals: true });

export default mongoose.models.Invitation || mongoose.model("Invitation", InvitationSchema);
