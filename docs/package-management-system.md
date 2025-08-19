# Package Management System

Sistem manajemen paket untuk aplikasi undangan digital yang memungkinkan admin untuk mengelola berbagai paket layanan.

## Fitur Utama

### 1. Model Package (MongoDB)
- **Nama dan Deskripsi**: Informasi dasar paket
- **Harga**: Harga normal dan harga diskon
- **Durasi**: Masa berlaku paket (hari/bulan/tahun/seumur hidup)
- **Fitur**: Daftar fitur yang disertakan dalam paket
- **Batasan**: Limit untuk berbagai aspek (undangan, tamu, foto, dll)
- **Metadata**: Pengaturan tampilan (warna, ikon, badge)
- **Status**: Aktif/nonaktif, populer, unggulan

### 2. API Endpoints

#### GET /api/admin/packages
- Mengambil daftar semua paket
- Support pencarian dan filter
- Support sorting

#### POST /api/admin/packages
- Membuat paket baru
- Validasi input lengkap

#### GET /api/admin/packages/[id]
- Mengambil detail paket berdasarkan ID

#### PUT /api/admin/packages/[id]
- Memperbarui paket yang sudah ada
- Validasi input lengkap

#### DELETE /api/admin/packages/[id]
- Menghapus paket

#### POST /api/admin/packages/[id]/toggle-status
- Mengaktifkan/menonaktifkan paket

### 3. Halaman Admin

#### /admin/packages
- Daftar semua paket dalam tabel
- Fitur sorting, pencarian, dan filter
- Aksi: edit, toggle status, hapus
- Tombol untuk membuat paket baru

#### /admin/packages/new
- Form untuk membuat paket baru
- Validasi form di frontend
- Handling error dan success

#### /admin/packages/[id]/edit
- Form untuk mengedit paket yang sudah ada
- Pre-populate dengan data existing
- Validasi dan error handling

## Struktur Data Package

```javascript
{
  name: String,                    // Nama paket
  description: String,             // Deskripsi paket
  price: Number,                   // Harga paket
  originalPrice: Number,           // Harga asli (untuk diskon)
  duration: {
    value: Number,                 // Nilai durasi
    unit: String                   // Satuan: days, months, years, lifetime
  },
  features: [{
    name: String,                  // Nama fitur
    description: String,           // Deskripsi fitur
    included: Boolean,             // Apakah fitur disertakan
    limit: Number                  // Batasan fitur (null = unlimited)
  }],
  limits: {
    invitations: Number,           // Max jumlah undangan
    guests: Number,                // Max tamu per undangan
    photos: Number,                // Max foto
    templates: [String],           // Template yang tersedia
    customDomain: Boolean,         // Izin custom domain
    removeWatermark: Boolean,      // Hapus watermark
    analytics: Boolean,            // Akses analytics
    priority_support: Boolean      // Dukungan prioritas
  },
  metadata: {
    color: String,                 // Warna tema paket
    icon: String,                  // Icon paket (emoji)
    badge: String                  // Badge text (opsional)
  },
  isActive: Boolean,               // Status aktif
  isPopular: Boolean,              // Tandai sebagai populer
  isFeatured: Boolean,             // Tandai sebagai unggulan
  sortOrder: Number                // Urutan tampilan
}
```

## Virtual Fields

Model Package memiliki beberapa virtual fields yang dihitung otomatis:

- `formattedPrice`: Format harga dalam Rupiah
- `discountPercentage`: Persentase diskon jika ada originalPrice
- `isDiscounted`: Boolean apakah paket sedang diskon
- `durationText`: Text durasi yang mudah dibaca

## Authentication & Authorization

Semua endpoint admin dilindungi dengan middleware `adminAuth` yang:
- Memverifikasi session admin
- Memastikan admin memiliki akses yang valid

## Error Handling

Sistem memiliki error handling yang komprehensif:
- Validasi input di level API
- Error messages yang informatif dalam bahasa Indonesia
- Handling untuk berbagai skenario error (404, 400, 500)

## Frontend Features

### Tabel Package Management
- Sorting berdasarkan berbagai kolom
- Search dan filter
- Pagination (jika diperlukan)
- Responsive design

### Form Management
- Validasi real-time
- Dynamic feature management
- Color picker untuk metadata
- Checkbox untuk berbagai opsi

### UI/UX
- Loading states
- Success/error notifications
- Confirmation dialogs untuk aksi destructive
- Consistent styling dengan admin theme

## Testing

### Manual Testing Checklist

1. **API Testing**
   - [ ] GET /api/admin/packages - list packages
   - [ ] POST /api/admin/packages - create package
   - [ ] GET /api/admin/packages/[id] - get package detail
   - [ ] PUT /api/admin/packages/[id] - update package
   - [ ] DELETE /api/admin/packages/[id] - delete package
   - [ ] POST /api/admin/packages/[id]/toggle-status - toggle status

2. **Frontend Testing**
   - [ ] Package list page loads correctly
   - [ ] Create new package form works
   - [ ] Edit package form works
   - [ ] Delete package works with confirmation
   - [ ] Toggle status works
   - [ ] Search and filter work
   - [ ] Sorting works
   - [ ] Form validation works
   - [ ] Error handling works

3. **Integration Testing**
   - [ ] Database operations work correctly
   - [ ] Authentication works
   - [ ] Data consistency maintained

## Sample Data

Sistem dilengkapi dengan script untuk membuat sample data:

```bash
# Via direct MongoDB (jika MongoDB running locally)
node scripts/seed-packages.js

# Via API (jika Next.js server running)
node scripts/seed-packages-api.js
```

Sample packages yang dibuat:
1. **Basic** - Paket dasar (Rp 50,000)
2. **Premium** - Paket premium (Rp 150,000)
3. **Enterprise** - Paket enterprise (Rp 500,000)

## Deployment Notes

1. Pastikan environment variable `MONGODB_URI` sudah diset
2. Jalankan migration/seeding jika diperlukan
3. Test semua endpoint setelah deployment
4. Monitor error logs untuk issues

## Customer Management

### 1. User Management
- Melihat daftar semua pengguna
- Filter dan pencarian pengguna
- Detail informasi pengguna
- Riwayat pembelian per pengguna

### 2. Manual Order Processing
- Input pemesanan manual untuk order via WhatsApp
- Pembuatan akun user otomatis
- Pembuatan undangan melalui admin panel
- Tracking status pemesanan

### 3. Purchase History
- Riwayat transaksi lengkap
- Filter berdasarkan paket/periode
- Export data transaksi
- Detail status pembayaran

## Future Enhancements

1. **Package Analytics**
   - Track package popularity
   - Usage statistics
   - Revenue tracking

2. **Package Templates**
   - Pre-defined package templates
   - Quick setup options

3. **Bulk Operations**
   - Bulk edit packages
   - Bulk status changes

4. **Advanced Filtering**
   - Date range filters
   - Advanced search options

5. **Package Versioning**
   - Track package changes
   - Rollback capabilities

6. **Integration Features**
   - Payment gateway integration
   - Subscription management
   - Auto-renewal options
