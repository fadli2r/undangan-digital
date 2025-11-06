#!/usr/bin/env node

/**
 * Script untuk menambahkan layout.tsx dengan metadata ke folder app/
 * Usage: node scripts/add-app-metadata.js
 */

const fs = require('fs');
const path = require('path');

// Daftar folder yang perlu ditambahkan layout.tsx dengan metadata
const foldersToUpdate = [
  {
    path: 'app/kontak',
    title: 'Kontak Kami - Dreamslink',
    description: 'Hubungi kami untuk pertanyaan, dukungan, atau konsultasi tentang undangan digital Anda.',
    canonical: '/kontak'
  },
  {
    path: 'app/portofolio',
    title: 'Portofolio - Dreamslink',
    description: 'Lihat koleksi undangan digital yang telah kami buat untuk berbagai acara spesial.',
    canonical: '/portofolio'
  },
  {
    path: 'app/produk',
    title: 'Produk & Layanan - Dreamslink',
    description: 'Jelajahi produk dan layanan undangan digital kami untuk berbagai kebutuhan acara Anda.',
    canonical: '/produk'
  },
  {
    path: 'app/tentang',
    title: 'Tentang Kami - Dreamslink',
    description: 'Kenali lebih dekat Dreamslink, platform undangan digital terpercaya di Indonesia.',
    canonical: '/tentang'
  },
  {
    path: 'app/buku-tamu/[slug]',
    title: 'Buku Tamu Digital - Dreamslink',
    description: 'Kelola kehadiran tamu dengan buku tamu digital yang modern dan efisien.',
    canonical: '/buku-tamu',
    noindex: true
  },
  {
    path: 'app/scanner/[slug]',
    title: 'Scanner QR Code - Dreamslink',
    description: 'Scan QR code untuk mencatat kehadiran tamu secara digital.',
    canonical: '/scanner',
    noindex: true
  },
  {
    path: 'app/preview/[slug]',
    title: 'Preview Undangan - Dreamslink',
    description: 'Preview undangan digital Anda sebelum dipublikasikan.',
    canonical: '/preview',
    noindex: true
  },
  {
    path: 'app/undangan/[slug]',
    title: 'Undangan Digital - Dreamslink',
    description: 'Undangan digital yang elegan dan modern untuk acara spesial Anda.',
    canonical: '/undangan'
  }
];

function createLayoutFile(folderConfig) {
  const folderPath = path.join(process.cwd(), folderConfig.path);
  const layoutPath = path.join(folderPath, 'layout.tsx');
  
  // Cek apakah folder ada
  if (!fs.existsSync(folderPath)) {
    console.log(`❌ Folder tidak ditemukan: ${folderConfig.path}`);
    return false;
  }

  // Cek apakah sudah ada layout.tsx
  if (fs.existsSync(layoutPath)) {
    console.log(`⏭️  Skip (sudah ada layout.tsx): ${folderConfig.path}`);
    return false;
  }

  // Template layout.tsx
  const robotsConfig = folderConfig.noindex 
    ? `  robots: {
    index: false,
    follow: false,
  },`
    : `  robots: {
    index: true,
    follow: true,
  },`;

  const layoutContent = `// ${folderConfig.path}/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "${folderConfig.title}",
  description: "${folderConfig.description}",
  openGraph: {
    title: "${folderConfig.title}",
    description: "${folderConfig.description}",
    url: "${folderConfig.canonical}",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "${folderConfig.title}",
    description: "${folderConfig.description}",
  },
${robotsConfig}
  alternates: {
    canonical: "${folderConfig.canonical}",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section>{children}</section>;
}
`;

  // Tulis file
  try {
    fs.writeFileSync(layoutPath, layoutContent, 'utf8');
    console.log(`✅ Berhasil membuat: ${folderConfig.path}/layout.tsx`);
    return true;
  } catch (error) {
    console.log(`❌ Gagal membuat: ${folderConfig.path}/layout.tsx - ${error.message}`);
    return false;
  }
}

// Main execution
console.log('🚀 Memulai proses penambahan layout.tsx dengan metadata...\n');

let successCount = 0;
let skipCount = 0;
let failCount = 0;

foldersToUpdate.forEach((folderConfig) => {
  const result = createLayoutFile(folderConfig);
  if (result === true) {
    successCount++;
  } else if (result === false && fs.existsSync(path.join(process.cwd(), folderConfig.path))) {
    skipCount++;
  } else {
    failCount++;
  }
});

console.log('\n📊 Ringkasan:');
console.log(`✅ Berhasil: ${successCount} file`);
console.log(`⏭️  Di-skip: ${skipCount} file`);
console.log(`❌ Gagal: ${failCount} file`);
console.log('\n✨ Selesai!');
