// ==========================================
// ✅ Hybrid version - support Next.js Pages & App Router
// ==========================================

import Template from "@/models/Template";
import ClassicTemplate from "@/components/templates/Classic";
import ModernTemplate from "@/components/templates/Modern";

// 1️⃣ Manual import (karena import.meta.glob() belum stabil di Pages Router)
export const templateComponentMap = {
  classic: ClassicTemplate,
  modern: ModernTemplate,
  // tambahkan manual di sini kalau ada file baru
};

// 2️⃣ Fallback daftar default template
export const defaultTemplateList = [
  {
    slug: "classic",
    name: "Classic Elegant",
    thumbnail: "/images/bg_couple.jpg",
    description: "Tampilan formal dan elegan dengan sentuhan klasik.",
    component: ClassicTemplate,
    isPremium: false,
    price: 0,
  },
  {
    slug: "modern",
    name: "Modern Simple",
    thumbnail: "/images/bg_couple.jpg",
    description: "Desain bersih dan minimalis, cocok untuk pasangan modern.",
    component: ModernTemplate,
    isPremium: true,
    price: 150000,
  },
];

// 3️⃣ Ambil semua template dari DB (fallback ke default)
export async function getAllTemplates(options = {}) {
  const { includeInactive = false } = options;

  try {
    const query = includeInactive ? {} : { isActive: true };
    const dbTemplates = await Template.find(query).lean();

    const all = [
      ...defaultTemplateList,
      ...dbTemplates.map((tpl) => ({
        ...tpl,
        component: templateComponentMap[tpl.slug] || null,
      })),
    ];

    // Hapus duplikat slug (utamakan DB)
    return Array.from(new Map(all.map((t) => [t.slug, t])).values());
  } catch (err) {
    console.error("❌ Gagal load template:", err);
    return defaultTemplateList;
  }
}

// 4️⃣ Dapatkan komponen template berdasarkan slug
export function getTemplateComponent(slug) {
  return templateComponentMap[slug] || templateComponentMap["classic"];
}
