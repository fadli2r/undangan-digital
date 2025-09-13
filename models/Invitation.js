import mongoose from "mongoose";

/* ---------------- Sub-schemas ---------------- */
const RSVPItem = new mongoose.Schema(
  {
    nama: String,
    status: String, // "Hadir", "Tidak Hadir", "Ragu-ragu"
    jumlah: { type: Number, default: 1 },
    waktu: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UcapanItem = new mongoose.Schema(
  {
    nama: String,
    pesan: String,
    waktu: { type: Date, default: Date.now },
  },
  { _id: false }
);

const AcaraItem = new mongoose.Schema(
  {
    nama: String, // "Akad", "Resepsi", dll.
    tanggal: Date,
    waktu: String,
    lokasi: String,
    alamat: String,
  },
  { _id: false }
);

/* ---------------- Helpers ---------------- */
const sanitizeSlug = (raw) =>
  String(raw || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");

const normKeys = (arr) => {
  if (!Array.isArray(arr)) return [];
  return Array.from(
    new Set(
      arr
        .map((k) => String(k || "").toLowerCase().trim())
        .filter(Boolean)
    )
  );
};

/* ---------------- Main schema ---------------- */
const InvitationSchema = new mongoose.Schema({
  // Data utama
  user_email: { type: String, required: true, index: true },
  slug: { type: String, required: true, unique: true },
  custom_slug: { type: String, default: "" },
  template: { type: String, required: true, default: "classic" },

  // Paket & fitur yang diizinkan untuk editor
  packageId: { type: mongoose.Schema.Types.ObjectId, ref: "Package", index: true },
  allowedFeatures: { type: [String], default: [] }, // contoh: ["gift","rsvp","galeri","all-custom"]

  // Data mempelai
  mempelai: {
    pria: String,
    wanita: String,
    foto_pria: String,
    foto_wanita: String,
    orangtua_pria: String,
    orangtua_wanita: String,
  },

  // Multi-acara
  acara: [AcaraItem],
  acara_utama: {
    nama: String,
    tanggal: Date,
    waktu: String,
    lokasi: String,
    alamat: String,
  },

  // Galeri
  galeri: [String],
  main_photo: { type: String, default: "" },
  background_photo: { type: String, default: "" },

  // Informasi tambahan
  tambahan: {
    catatan: { type: String, default: "" },
    dresscode: {
      baju: { type: String, default: "#000000" },
      celana: { type: String, default: "#000000" },
    },
    maps_url: { type: String, default: "" },
    protokol: { type: String, default: "" },
    musik: {
      enabled: { type: Boolean, default: false },
      url: { type: String, default: "" }, // file / youtube / spotify
      type: { type: String, default: "file" },
      autoplay: { type: Boolean, default: true },
    },
    live_streaming: {
      enabled: { type: Boolean, default: false },
      youtube_url: { type: String, default: "" },
    },
    instagram_pria: { type: String, default: "" },
    instagram_wanita: { type: String, default: "" },
  },

  // Our Story
  our_story: {
    main_photo: { type: String, default: "" },
    title: { type: String, default: "" },
    stories: [
      {
        heading: String,
        content: String,
      },
    ],
  },

  // Digital Gift
  gift: {
    enabled: { type: Boolean, default: false },
    bank_accounts: [
      {
        bank: String,
        nomor: String,
        atas_nama: String,
        logo: String,
      },
    ],
    e_wallets: [
      {
        nama: String,
        nomor: String,
        qr_code: String,
        logo: String,
      },
    ],
    qris: {
      enabled: { type: Boolean, default: false },
      image_url: String,
      merchant_name: String,
    },
    konfirmasi: [
      {
        nama: String,
        nominal: Number,
        bank: String,
        pesan: String,
        waktu: { type: Date, default: Date.now },
      },
    ],
  },

  // Privacy
  privacy: {
    isPasswordProtected: { type: Boolean, default: false },
    password: { type: String, default: "" },
    hideGuestbook: { type: Boolean, default: false },
    hideRSVP: { type: Boolean, default: false },
  },

  // RSVP & Ucapan
  rsvp: [RSVPItem],
  ucapan: [UcapanItem],

  // Tamu
  tamu: [
    {
      nama: String,
      email: String,
      kode: String, // kode unik
    },
  ],

  // Stats
  views: { type: Number, default: 0 },
  lastViewed: { type: Date },

  // Attendance
  attendance: [
    {
      name: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],

  // Timestamps manual
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

/* ---------------- Indexes tambahan ---------------- */
InvitationSchema.index({ user_email: 1, slug: 1 }); // query per user + slug cepat

/* ---------------- Virtuals ---------------- */
InvitationSchema.virtual("isExpired").get(function () {
  if (!this.createdAt) return false;
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  return this.createdAt < oneYearAgo;
});

/* ---------------- Middleware ---------------- */
InvitationSchema.pre("validate", function (next) {
  // normalisasi email
  if (this.user_email) {
    this.user_email = String(this.user_email).toLowerCase().trim();
  }

  // normalisasi & pastikan slug aman
  if (this.slug) {
    this.slug = sanitizeSlug(this.slug);
  } else {
    const base =
      this.custom_slug ||
      `${this?.mempelai?.pria || ""}-${this?.mempelai?.wanita || ""}` ||
      "undangan";
    this.slug = sanitizeSlug(base) || "undangan";
  }

  // sanitasi custom slug juga (jika diisi)
  if (this.custom_slug) {
    this.custom_slug = sanitizeSlug(this.custom_slug);
  }

  // normalisasi allowedFeatures
  if (this.isModified("allowedFeatures") || !Array.isArray(this.allowedFeatures)) {
    this.allowedFeatures = normKeys(this.allowedFeatures);
  }

  next();
});

InvitationSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

InvitationSchema.set("toJSON", { virtuals: true });
InvitationSchema.set("toObject", { virtuals: true });

export default mongoose.models.Invitation ||
  mongoose.model("Invitation", InvitationSchema);
