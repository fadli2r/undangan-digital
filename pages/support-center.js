// pages/support-center.js
import { useMemo, useState } from "react";
import Link from "next/link";
import UserLayout from "../components/layouts/UserLayout";

const CATEGORIES = [
  { key: "akun",    title: "Akun & Login",            icon: "ki-duotone ki-user" },
  { key: "paket",   title: "Paket & Pembayaran",      icon: "ki-duotone ki-credit-cart" },
  { key: "buat",    title: "Pembuatan Undangan",      icon: "ki-duotone ki-calendar" },
  { key: "template",title: "Template & Kustomisasi",  icon: "ki-duotone ki-brush" },
  { key: "tamu",    title: "Tamu & RSVP",             icon: "ki-duotone ki-people" },
  { key: "teknis",  title: "Masalah Teknis",          icon: "ki-duotone ki-setting" },
];

const FAQS = [
  // AKUN
  {
    id: "faq-akun-1",
    category: "akun",
    q: "Saya tidak bisa login, bagaimana solusinya?",
    a: "Pastikan email/Google account benar. Jika pakai password manual, gunakan fitur Lupa Password di halaman login. Jika tetap gagal, hubungi support kami.",
  },
  {
    id: "faq-akun-2",
    category: "akun",
    q: "Bagaimana cara verifikasi email?",
    a: "Kami kirim tautan verifikasi ke email setelah registrasi. Buka email tersebut dan klik tombol Verifikasi.",
  },

  // PAKET
  {
    id: "faq-paket-1",
    category: "paket",
    q: "Metode pembayaran apa saja yang didukung?",
    a: "Kami menggunakan Xendit: transfer bank, e-wallet, QRIS, retail, dan virtual account. Invoice otomatis terbit setelah checkout.",
  },
  {
    id: "faq-paket-2",
    category: "paket",
    q: "Pembayaran sudah berhasil tapi status belum berubah?",
    a: "Butuh beberapa detik sampai webhook Xendit kami proses. Refresh dashboard. Jika masih pending, kirimkan nomor invoice ke support.",
  },

  // BUAT UNDANGAN
  {
    id: "faq-buat-1",
    category: "buat",
    q: "Bagaimana cara membuat undangan pertama saya?",
    a: "Buka menu Buat Undangan, pilih template, isi data mempelai & acara, konfirmasi, lalu sistem akan membuat draft undangan.",
  },
  {
    id: "faq-buat-2",
    category: "buat",
    q: "Apa itu kuota undangan?",
    a: "Kuota adalah jumlah undangan yang bisa kamu buat. Saat pembelian paket berhasil, kuota akan bertambah. Kuota berkurang 1 setiap kali membuat undangan baru.",
  },

  // TEMPLATE
  {
    id: "faq-template-1",
    category: "template",
    q: "Bisakah saya ganti template setelah undangan dibuat?",
    a: "Bisa. Masuk ke halaman edit undangan, pilih tab Template, lalu ganti ke template lain yang tersedia di paketmu.",
  },
  {
    id: "faq-template-2",
    category: "template",
    q: "Bisa upload musik sendiri?",
    a: "Bisa, unggah file audio (mp3) pada bagian Pengaturan Musik di halaman edit undangan.",
  },

  // TAMU & RSVP
  {
    id: "faq-tamu-1",
    category: "tamu",
    q: "Bagaimana mengelola daftar tamu?",
    a: "Buka undangan → tab Tamu. Kamu bisa impor dari CSV, tambah manual, dan lihat status RSVP secara realtime.",
  },
  {
    id: "faq-tamu-2",
    category: "tamu",
    q: "Apakah tamu bisa mengirim ucapan?",
    a: "Ya. Ucapan akan tampil di halaman undangan dan bisa dimoderasi pada dashboard.",
  },

  // TEKNIS
  {
    id: "faq-teknis-1",
    category: "teknis",
    q: "Mode gelap/terang tidak berubah?",
    a: "Pastikan skrip inisialisasi theme Metronic sudah berjalan saat page load dan localStorage tidak memaksa mode tertentu.",
  },
  {
    id: "faq-teknis-2",
    category: "teknis",
    q: "Halaman tampak berantakan setelah kustomisasi CSS?",
    a: "Cek urutan import CSS (plugins.bundle.css terlebih dulu, lalu style.bundle.css, lalu CSS custom). Gunakan prefix class agar gaya tidak bentrok.",
  },
];

export default function SupportCenter() {
  const [term, setTerm] = useState("");
  const [activeCat, setActiveCat] = useState("akun");

  const filteredFaqs = useMemo(() => {
    const t = term.trim().toLowerCase();
    let list = FAQS;
    if (activeCat) list = list.filter(i => i.category === activeCat);
    if (t) {
      list = list.filter(i =>
        i.q.toLowerCase().includes(t) || i.a.toLowerCase().includes(t)
      );
    }
    return list;
  }, [term, activeCat]);

  return (
    <UserLayout>
      <div className="card">
                  <div className="card-body p-lg-15">

        {/* Header */}
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-8">
          <div className="mb-4 mb-md-0">
            <h1 className="fw-bolder text-gray-900 mb-2">Pusat Bantuan</h1>
            <div className="text-muted">
              Pertanyaan umum, panduan singkat, dan sumber daya Undangan Digital.
            </div>
          </div>
          <div>
            <Link href="/dashboard" className="btn btn-light me-2">Dashboard</Link>
            <Link href="/paket" className="btn btn-primary">Lihat Paket</Link>
          </div>
        </div>

        {/* Search Bar (inspired by Classic FAQ header/search) */}
        <div className="card mb-10">
          <div className="card-body p-6 p-md-10">
            <div className="d-flex align-items-center">
              <i className="ki-duotone ki-magnifier fs-2 text-gray-500 me-3"></i>
              <input
                type="text"
                className="form-control form-control-lg form-control-solid"
                placeholder="Cari topik: pembayaran, template, RSVP…"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
              />
            </div>
            <div className="form-text mt-3">
              Ketik kata kunci untuk memfilter pertanyaan di bawah.
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="row g-6 mb-10">
          {CATEGORIES.map((c) => (
            <div className="col-6 col-md-4 col-xl-2" key={c.key}>
              <button
                type="button"
                onClick={() => setActiveCat(c.key)}
                className={`btn btn-outline btn-flex flex-column w-100 h-100 py-6 ${activeCat === c.key ? "active btn-active-light-primary" : ""}`}
                aria-pressed={activeCat === c.key}
              >
                <i className={`${c.icon} fs-2 mb-3`}></i>
                <span className="fw-semibold">{c.title}</span>
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Accordion (structure mirrors template’s collapse usage) */}
        <div className="card mb-12">
          <div className="card-header border-0">
            <h3 className="card-title fw-bold text-gray-800 mb-0">
              Pertanyaan pada kategori: {CATEGORIES.find(c => c.key === activeCat)?.title}
            </h3>
          </div>
          <div className="card-body pt-0">
            <div className="accordion" id="faq_accordion">
  {filteredFaqs.map((item, idx) => {
    const headingId = `faq_h_${item.id}`;
    const collapseId = `faq_c_${item.id}`;
    const isFirst = idx === 0;

    return (
      <div className="accordion-item mb-4" key={item.id}>
        <h2 className="accordion-header" id={headingId}>
          <button
            className={`accordion-button ${isFirst ? "" : "collapsed"} py-4`}
            type="button"
            data-bs-toggle="collapse"
            data-bs-target={`#${collapseId}`}
            aria-expanded={isFirst ? "true" : "false"}
            aria-controls={collapseId}
          >
            <i className="ki-duotone ki-question-2 text-primary fs-2 me-3">
              <span className="path1"></span><span className="path2"></span>
            </i>
            <span className="text-gray-800 fw-bold">{item.q}</span>
          </button>
        </h2>

        <div
          id={collapseId}
          className={`accordion-collapse collapse ${isFirst ? "show" : ""}`}
          aria-labelledby={headingId}
          data-bs-parent="#faq_accordion"
        >
          <div className="accordion-body fs-6 text-gray-700 fw-semibold">
            {item.a}
          </div>
        </div>
      </div>
    );
  })}
</div>

          </div>
        </div>

        {/* Resource / Video section (adapted structure) */}
        <div className="d-flex flex-stack mb-5">
          <h3 className="text-gray-900">Sumber Daya & Tutorial</h3>
          <Link href="/blog" className="fs-6 fw-semibold link-primary">Lihat Semua</Link>
        </div>
        <div className="separator separator-dashed mb-9"></div>

        <div className="row g-10 mb-12">
          <div className="col-md-4">
            <div className="card-xl-stretch me-md-6">
              <a className="d-block bgi-no-repeat bgi-size-cover bgi-position-center card-rounded position-relative min-h-175px mb-5" style={{ backgroundImage: "url('/images/tutorial-1.jpg')" }} href="https://www.youtube.com/embed/btornGtLwIo" target="_blank" rel="noreferrer">
                <img src="/metronic/assets/media/svg/misc/video-play.svg" className="position-absolute top-50 start-50 translate-middle" alt="play" />
              </a>
              <div className="m-0">
                <a className="fs-4 text-gray-900 fw-bold text-hover-primary lh-base" href="https://youtu.be" target="_blank" rel="noreferrer">Mulai Membuat Undangan dari Nol</a>
                <div className="fw-semibold fs-6 text-gray-600 my-4">Panduan cepat dari pilih template sampai publish.</div>
              </div>
            </div>
          </div>
          {/* tambahkan 2 kartu lagi jika perlu */}
          <div className="col-md-4">
            <div className="card-xl-stretch me-md-6">
              <a className="d-block bgi-no-repeat bgi-size-cover bgi-position-center card-rounded position-relative min-h-175px mb-5" style={{ backgroundImage: "url('/images/tutorial-2.jpg')" }} href="https://www.youtube.com/embed/btornGtLwIo" target="_blank" rel="noreferrer">
                <img src="/metronic/assets/media/svg/misc/video-play.svg" className="position-absolute top-50 start-50 translate-middle" alt="play" />
              </a>
              <div className="m-0">
                <a className="fs-4 text-gray-900 fw-bold text-hover-primary lh-base" href="https://youtu.be" target="_blank" rel="noreferrer">Atur Tamu & RSVP</a>
                <div className="fw-semibold fs-6 text-gray-600 my-4">Impor kontak, kirim undangan, pantau kehadiran.</div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card-xl-stretch me-md-6">
              <a className="d-block bgi-no-repeat bgi-size-cover bgi-position-center card-rounded position-relative min-h-175px mb-5" style={{ backgroundImage: "url('/images/tutorial-3.jpg')" }} href="https://www.youtube.com/embed/btornGtLwIo" target="_blank" rel="noreferrer">
                <img src="/metronic/assets/media/svg/misc/video-play.svg" className="position-absolute top-50 start-50 translate-middle" alt="play" />
              </a>
              <div className="m-0">
                <a className="fs-4 text-gray-900 fw-bold text-hover-primary lh-base" href="https://youtu.be" target="_blank" rel="noreferrer">Kustomisasi Template</a>
                <div className="fw-semibold fs-6 text-gray-600 my-4">Ganti warna, font, musik, dan komponen sesuai selera.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact / Social style card (patterned after the template’s social block) */}
        <div className="card mb-4 bg-light text-center">
          <div className="card-body py-12">
            <div className="mb-5 fw-bold">Butuh bantuan lanjut?</div>
            <div className="d-flex flex-wrap justify-content-center gap-3">
              <Link href="mailto:support@viding.co" className="btn btn-primary px-6">Email Support</Link>
              <Link href="https://wa.me/6281234567890" className="btn btn-success px-6" target="_blank">WhatsApp</Link>
              <Link href="/ticket/new" className="btn btn-light px-6">Buka Tiket</Link>
            </div>
          </div>
        </div>
      </div>
      </div>
    </UserLayout>
  );
}
