// lib/getSettings.ts
import "server-only";
import dbConnect from "@/utils/db";
import Settings from "@/models/Settings";

export async function fetchSettings() {
  await dbConnect();
  // pakai static method kalau ada, kalau tidak pakai fallback
  try {
    // @ts-ignore
    if (typeof Settings.getSettings === "function") {
      // @ts-ignore
      const s = await Settings.getSettings();
      return s?.toObject?.() ?? JSON.parse(JSON.stringify(s));
    }
  } catch (_) {}
  const s = await Settings.findOne({});
  return s?.toObject?.() ?? JSON.parse(JSON.stringify(s || {}));
}
