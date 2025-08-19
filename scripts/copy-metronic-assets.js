const fs = require('fs');
const path = require('path');

// Script untuk copy assets Metronic ke project Next.js
// Jalankan dengan: node scripts/copy-metronic-assets.js

const METRONIC_SOURCE = '../Downloads/metronic_html_v8.3.0_demo3/demo3';
const DEST_PUBLIC = './public/metronic';

// Buat folder destination jika belum ada
if (!fs.existsSync(DEST_PUBLIC)) {
  fs.mkdirSync(DEST_PUBLIC, { recursive: true });
}

// Daftar folder/file yang perlu dicopy
const assetsToCopy = [
  'assets/css',
  'assets/js', 
  'assets/media',
  'assets/plugins'
];

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(function(childItemName) {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

console.log('🚀 Mulai copy assets Metronic...');

assetsToCopy.forEach(assetPath => {
  const sourcePath = path.join(METRONIC_SOURCE, assetPath);
  const destPath = path.join(DEST_PUBLIC, assetPath);
  
  if (fs.existsSync(sourcePath)) {
    console.log(`📁 Copying ${assetPath}...`);
    copyRecursiveSync(sourcePath, destPath);
    console.log(`✅ ${assetPath} copied successfully`);
  } else {
    console.log(`❌ ${sourcePath} not found`);
  }
});

console.log('🎉 Selesai! Assets Metronic telah dicopy ke public/metronic/');
console.log('📝 Selanjutnya update layout components untuk menggunakan local assets');
