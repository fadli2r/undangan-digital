# Dashboard Components

Koleksi komponen dashboard yang dapat digunakan kembali untuk aplikasi undangan digital.

## Komponen yang Tersedia

### 1. KPICard
Komponen untuk menampilkan Key Performance Indicator (KPI) dengan berbagai kustomisasi.

**Props:**
- `title` (string): Judul KPI
- `value` (number/string): Nilai utama yang ditampilkan
- `subtitle` (object): { label: string, value: string/number }
- `icon` (string): Kelas CSS untuk ikon
- `backgroundColor` (string): Warna latar belakang (default: "#F1416C")
- `textColor` (string): Warna teks (default: "white")
- `badge` (ReactNode): Konten badge tambahan
- `trend` (object): { value: number, label: string }

**Contoh Penggunaan:**
```jsx
<KPICard
  title="Total Pengunjung"
  value={1250}
  icon="ki-duotone ki-eye"
  backgroundColor="#7239EA"
  trend={{
    value: 15,
    label: "Naik dari minggu lalu"
  }}
/>
```

### 2. ChartCard
Komponen untuk menampilkan berbagai jenis chart menggunakan ApexCharts.

**Props:**
- `title` (string): Judul chart
- `subtitle` (string): Subjudul chart
- `type` (string): Jenis chart ("area", "line", "bar", "donut", "pie")
- `series` (array): Data series untuk chart
- `categories` (array): Kategori untuk sumbu X
- `height` (number): Tinggi chart (default: 280)
- `loading` (boolean): Status loading
- `colors` (array): Array warna untuk chart
- `customOptions` (object): Opsi kustom ApexCharts
- `showToolbar` (boolean): Tampilkan toolbar chart
- `showLegend` (boolean): Tampilkan legend

**Contoh Penggunaan:**
```jsx
<ChartCard
  title="Statistik Pengunjung"
  type="area"
  categories={["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]}
  series={[{ name: "Pengunjung", data: [12, 19, 3, 5, 2, 3, 9] }]}
  colors={["#0d6efd"]}
/>
```

### 3. InvitationTable
Komponen tabel untuk menampilkan daftar undangan dengan fitur pencarian, filter, dan sorting.

**Props:**
- `invitations` (array): Array data undangan
- `loading` (boolean): Status loading
- `onEdit` (function): Callback untuk edit undangan
- `onView` (function): Callback untuk melihat undangan
- `onDelete` (function): Callback untuk hapus undangan

**Contoh Penggunaan:**
```jsx
<InvitationTable
  invitations={undanganTerbaru}
  loading={loading}
  onEdit={(invitation) => router.push(`/edit/${invitation.slug}`)}
  onView={(invitation) => window.open(`/undangan/${invitation.slug}`)}
  onDelete={(invitation) => handleDelete(invitation)}
/>
```

### 4. NotificationPanel
Komponen untuk menampilkan panel notifikasi dengan timeline.

**Props:**
- `notifications` (array): Array notifikasi
- `loading` (boolean): Status loading

**Format Data Notifikasi:**
```javascript
{
  id: "unique-id",
  pesan: "Pesan notifikasi",
  waktu: "Hari ini",
  type: "success" | "info" | "warning" | "danger",
  action: {
    label: "Lihat Detail",
    onClick: () => {},
    href: "/link"
  }
}
```

### 5. UpcomingEventsCard
Komponen untuk menampilkan undangan yang mendekati tanggal acara.

**Props:**
- `events` (array): Array undangan yang akan datang
- `loading` (boolean): Status loading

### 6. QuickActionsCard
Komponen untuk menampilkan aksi-aksi cepat yang dapat dilakukan user.

**Props:**
- `actions` (array): Array aksi kustom (opsional)
- `customActions` (array): Array aksi tambahan

**Format Data Action:**
```javascript
{
  id: "unique-id",
  label: "Buat Undangan",
  icon: "ki-duotone ki-plus",
  href: "/buat-undangan",
  color: "primary",
  description: "Buat undangan digital baru",
  buttonText: "Akses",
  external: false
}
```

### 7. TipsCard
Komponen untuk menampilkan tips optimasi berdasarkan statistik.

**Props:**
- `stats` (object): Objek statistik untuk generate tips
- `customTips` (array): Array tips kustom
- `showDismiss` (boolean): Tampilkan tombol dismiss (default: true)

**Format Stats:**
```javascript
{
  conversion: 25,
  avgUcapanPerUndangan: 8,
  pengunjungDelta: 15,
  totalPengunjung: 1250,
  totalRSVP: 312
}
```

## Instalasi dan Setup

1. Pastikan dependencies berikut terinstall:
```bash
npm install react-apexcharts apexcharts
```

2. Import komponen yang dibutuhkan:
```jsx
import {
  KPICard,
  ChartCard,
  InvitationTable,
  NotificationPanel,
  UpcomingEventsCard,
  QuickActionsCard,
  TipsCard
} from "../components/dashboard";
```

## Styling

Komponen-komponen ini menggunakan Metronic CSS framework. Pastikan file CSS Metronic sudah diload:

```html
<link href="/metronic/assets/css/style.bundle.css" rel="stylesheet" type="text/css" />
```

## Contoh Implementasi Lengkap

Lihat file `pages/dashboard-final.js` untuk contoh implementasi lengkap semua komponen dalam satu dashboard.

## Kustomisasi

Setiap komponen dapat dikustomisasi lebih lanjut dengan:
- Mengubah props yang tersedia
- Menambahkan CSS kustom
- Meng-extend komponen untuk kebutuhan spesifik

## Tips Penggunaan

1. **Performance**: Gunakan `loading` prop untuk memberikan feedback visual saat data sedang dimuat
2. **Responsiveness**: Komponen sudah responsive, tapi pastikan layout grid Bootstrap digunakan dengan benar
3. **Data Format**: Pastikan format data sesuai dengan yang diharapkan komponen
4. **Error Handling**: Tambahkan error handling untuk kasus data kosong atau error API
