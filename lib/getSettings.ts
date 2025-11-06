// lib/getSettings.ts
import "server-only";
import dbConnect from "@/utils/db";
import Settings from "@/models/Settings";

// Default fallback settings jika database tidak tersedia
const DEFAULT_SETTINGS = {
  general: {
    siteName: "Dreamslink Invitation",
    siteDescription: "Buat undangan pernikahan digital yang elegan dan modern.",
  },
  seo: {
    metaTitle: "Dreamslink Invitation - Undangan Digital",
    metaDescription: "Buat undangan pernikahan digital yang elegan dan modern.",
    metaKeywords: "undangan digital, undangan pernikahan",
  },
};

export async function fetchSettings() {
  try {
    // Coba koneksi ke database
    await dbConnect();
    
    // Pakai static method kalau ada, kalau tidak pakai fallback
    try {
      // @ts-ignore
      if (typeof Settings.getSettings === "function") {
        // @ts-ignore
        const s = await Settings.getSettings();
        return s?.toObject?.() ?? JSON.parse(JSON.stringify(s));
      }
    } catch (_) {
      // Ignore error dari static method
    }
    
    const s = await Settings.findOne({});
    return s?.toObject?.() ?? JSON.parse(JSON.stringify(s || DEFAULT_SETTINGS));
  } catch (error) {
    // Jika koneksi database gagal (misalnya saat build time), return default settings
    console.warn("Failed to fetch settings from database, using defaults:", error);
    return DEFAULT_SETTINGS;
  }
}
