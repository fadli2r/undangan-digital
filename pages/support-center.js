// pages/support-center.js
'use client'

import { useMemo, useState } from "react";
import Link from "next/link";
import UserLayout from "../components/layouts/UserLayout";

// Kategori & FAQ (tetap pakai kontenmu)
const CATEGORIES = [
  { key: "akun",    title: "Akun & Login",            icon: "ki-user" },
  { key: "paket",   title: "Paket & Pembayaran",      icon: "ki-credit-cart" },
  { key: "buat",    title: "Pembuatan Undangan",      icon: "ki-calendar" },
  { key: "template",title: "Template & Kustomisasi",  icon: "ki-brush" },
  { key: "tamu",    title: "Tamu & RSVP",             icon: "ki-people" },
  { key: "teknis",  title: "Masalah Teknis",          icon: "ki-setting" },
];

const FAQS = [
  // AKUN
  { id: "faq-akun-1", category: "akun", q: "Saya tidak bisa login, bagaimana solusinya?", a: "Pastikan email/Google account benar. Jika pakai password manual, gunakan fitur Lupa Password di halaman login. Jika tetap gagal, hubungi support kami." },
  { id: "faq-akun-2", category: "akun", q: "Bagaimana cara verifikasi email?", a: "Kami kirim tautan verifikasi ke email setelah registrasi. Buka email tersebut dan klik tombol Verifikasi." },

  // PAKET
  { id: "faq-paket-1", category: "paket", q: "Metode pembayaran apa saja yang didukung?", a: "Kami menggunakan Xendit: transfer bank, e-wallet, QRIS, retail, dan virtual account. Invoice otomatis terbit setelah checkout." },
  { id: "faq-paket-2", category: "paket", q: "Pembayaran sudah berhasil tapi status belum berubah?", a: "Butuh beberapa detik sampai webhook Xendit kami proses. Refresh dashboard. Jika masih pending, kirimkan nomor invoice ke support." },

  // BUAT UNDANGAN
  { id: "faq-buat-1", category: "buat", q: "Bagaimana cara membuat undangan pertama saya?", a: "Buka menu Buat Undangan, pilih template, isi data mempelai & acara, konfirmasi, lalu sistem akan membuat draft undangan." },
  { id: "faq-buat-2", category: "buat", q: "Apa itu kuota undangan?", a: "Kuota adalah jumlah undangan yang bisa kamu buat. Saat pembelian paket berhasil, kuota akan bertambah. Kuota berkurang 1 setiap kali membuat undangan baru." },

  // TEMPLATE
  { id: "faq-template-1", category: "template", q: "Bisakah saya ganti template setelah undangan dibuat?", a: "Bisa. Masuk ke halaman edit undangan, pilih tab Template, lalu ganti ke template lain yang tersedia di paketmu." },
  { id: "faq-template-2", category: "template", q: "Bisa upload musik sendiri?", a: "Bisa, unggah file audio (mp3) pada bagian Pengaturan Musik di halaman edit undangan." },

  // TAMU & RSVP
  { id: "faq-tamu-1", category: "tamu", q: "Bagaimana mengelola daftar tamu?", a: "Buka undangan → tab Tamu. Kamu bisa impor dari CSV, tambah manual, dan lihat status RSVP secara realtime." },
  { id: "faq-tamu-2", category: "tamu", q: "Apakah tamu bisa mengirim ucapan?", a: "Ya. Ucapan akan tampil di halaman undangan dan bisa dimoderasi pada dashboard." },

  // TEKNIS
  { id: "faq-teknis-1", category: "teknis", q: "Mode gelap/terang tidak berubah?", a: "Pastikan skrip inisialisasi theme Metronic sudah berjalan saat page load dan localStorage tidak memaksa mode tertentu." },
  { id: "faq-teknis-2", category: "teknis", q: "Halaman tampak berantakan setelah kustomisasi CSS?", a: "Cek urutan import CSS (plugins.bundle.css terlebih dulu, lalu style.bundle.css, lalu CSS custom). Gunakan prefix class agar gaya tidak bentrok." },
];

// Helper render satu section (sesuai pola Metronic collapsible)
function FaqSection({ items, idPrefix }) {
  return (
    <>
      {items.map((item, idx) => {
        const collapseId = `${idPrefix}_${idx + 1}`;
        const show = idx === 0 ? "show" : "";
        const collapsed = idx === 0 ? "" : "collapsed";
        return (
          <div className="m-0" key={collapseId}>
            {/* Heading */}
            <div
              className={`d-flex align-items-center collapsible py-3 toggle mb-0 ${collapsed}`}
              data-bs-toggle="collapse"
              data-bs-target={`#${collapseId}`}
              role="button"
            >
              {/* Icon */}
              <div className="btn btn-sm btn-icon mw-20px btn-active-color-primary me-5">
                <i className="ki-duotone ki-minus-square toggle-on text-primary fs-1">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
                <i className="ki-duotone ki-plus-square toggle-off fs-1">
                  <span className="path1"></span>
                  <span className="path2"></span>
                  <span className="path3"></span>
                </i>
              </div>
              {/* Title */}
              <h4 className="text-gray-700 fw-bold cursor-pointer mb-0">{item.q}</h4>
            </div>
            {/* Body */}
            <div id={collapseId} className={`collapse ${show} fs-6 ms-1`}>
              <div className="mb-4 text-gray-600 fw-semibold fs-6 ps-10">{item.a}</div>
            </div>
            {/* Separator */}
            <div className="separator separator-dashed"></div>
          </div>
        );
      })}
    </>
  );
}

export default function SupportCenter() {
  // Optional: pencarian ringan (bila mau dipakai)
  const [term, setTerm] = useState("");

  // Bagi FAQ ke 3 kolom besar (sesuai layout contoh)
  const group1 = useMemo(() => FAQS.filter(f => ["akun","paket"].includes(f.category)), []);
  const group2 = useMemo(() => FAQS.filter(f => ["buat","template"].includes(f.category)), []);
  const group3 = useMemo(() => FAQS.filter(f => ["tamu","teknis"].includes(f.category)), []);

  const filtered1 = useMemo(() => {
    const t = term.trim().toLowerCase();
    return t ? group1.filter(i => i.q.toLowerCase().includes(t) || i.a.toLowerCase().includes(t)) : group1;
  }, [term, group1]);

  const filtered2 = useMemo(() => {
    const t = term.trim().toLowerCase();
    return t ? group2.filter(i => i.q.toLowerCase().includes(t) || i.a.toLowerCase().includes(t)) : group2;
  }, [term, group2]);

  const filtered3 = useMemo(() => {
    const t = term.trim().toLowerCase();
    return t ? group3.filter(i => i.q.toLowerCase().includes(t) || i.a.toLowerCase().includes(t)) : group3;
  }, [term, group3]);

  return (
    <UserLayout>
      {/* begin::Content */}


          {/* begin::FAQ card */}
          <div className="card">
            {/* begin::Body */}
            <div className="card-body p-lg-15">
              {/* begin::Classic content */}
              <div className="mb-13">
                {/* begin::Intro */}
                <div className="mb-15">
                  {/* Title */}
                  <h4 className="fs-2x text-gray-800 w-bolder mb-6">Frequently Asked Questions</h4>
                  {/* Text */}
                  <p className="fw-semibold fs-4 text-gray-600 mb-2">
                    Temukan jawaban cepat terkait akun, paket, pembuatan undangan, template, tamu & RSVP, serta kendala teknis.
                  </p>

                  {/* Search inline (opsional) */}
                  <div className="mt-6">
                    <div className="card">
                      <div className="card-body p-6 p-md-8">
                        <div className="d-flex align-items-center">
                          <i className="ki-duotone ki-magnifier fs-2 text-gray-500 me-3"><span className="path1"/><span className="path2"/></i>
                          <input
                            type="text"
                            className="form-control form-control-lg form-control-solid"
                            placeholder="Cari: login, pembayaran, RSVP, template…"
                            value={term}
                            onChange={(e) => setTerm(e.target.value)}
                          />
                        </div>
                        <div className="form-text mt-3">Ketik kata kunci untuk memfilter pertanyaan di bawah.</div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* end::Intro */}

                {/* begin::Row (1) */}
                <div className="row mb-12">
                  {/* begin::Col (kiri) */}
                  <div className="col-md-6 pe-md-10 mb-10 mb-md-0">
                    {/* Title */}
                    <h2 className="text-gray-800 fw-bold mb-4">Akun & Pembayaran</h2>
                    {/* Accordion ala Metronic */}
                    <FaqSection items={filtered1} idPrefix="kt_job_4" />
                  </div>
                  {/* end::Col */}

                  {/* begin::Col (kanan) */}
                  <div className="col-md-6 ps-md-10">
                    {/* Title */}
                    <h2 className="text-gray-800 fw-bold mb-4">Pembuatan & Kustomisasi</h2>
                    {/* Accordion ala Metronic */}
                    <FaqSection items={filtered2} idPrefix="kt_job_5" />
                  </div>
                  {/* end::Col */}
                </div>
                {/* end::Row (1) */}

                {/* begin::Row (2) */}
                <div className="row">
                  {/* begin::Col (kiri) */}
                  <div className="col-md-6 pe-md-10 mb-10 mb-md-0">
                    {/* Title */}
                    <h2 className="text-gray-800 w-bolder mb-4">Tamu & RSVP</h2>
                    {/* Accordion ala Metronic */}
                    <FaqSection items={filtered3.filter(i => i.category === "tamu")} idPrefix="kt_job_6" />
                  </div>
                  {/* end::Col */}

                  {/* begin::Col (kanan) */}
                  <div className="col-md-6 ps-md-10">
                    {/* Title */}
                    <h2 className="text-gray-800 fw-bold mb-4">Masalah Teknis</h2>
                    {/* Accordion ala Metronic */}
                    <FaqSection items={filtered3.filter(i => i.category === "teknis")} idPrefix="kt_job_7" />
                  </div>
                  {/* end::Col */}
                </div>
                {/* end::Row (2) */}
              </div>
              {/* end::Classic content */}

              {/* begin::Section (Video) */}
              <div className="mb-17">
                {/* Header */}
                <div className="d-flex flex-stack mb-5">
                  <h3 className="text-gray-900">Video Tutorials</h3>
                  <a href="/blog" className="fs-6 fw-semibold link-primary">View All Videos</a>
                </div>
                {/* Separator */}
                <div className="separator separator-dashed mb-9"></div>
                {/* Row */}
                <div className="row g-10">
                  <div className="col-md-4">
                    <div className="card-xl-stretch me-md-6">
                      <a
                        className="d-block bgi-no-repeat bgi-size-cover bgi-position-center card-rounded position-relative min-h-175px mb-5"
                        style={{ backgroundImage: "url('/images/tutorial-1.jpg')" }}
                        href="https://www.youtube.com/embed/btornGtLwIo"
                        target="_blank" rel="noreferrer"
                      >
                        <img src="/metronic/assets/media/svg/misc/video-play.svg" className="position-absolute top-50 start-50 translate-middle" alt="play" />
                      </a>
                      <div className="m-0">
                        <a href="https://youtu.be" target="_blank" rel="noreferrer" className="fs-4 text-gray-900 fw-bold text-hover-primary lh-base">
                          Admin Panel - Mulai dari Dashboard
                        </a>
                        <div className="fw-semibold fs-5 text-gray-600 my-4">
                          Panduan kilat orientasi dashboard & navigasi utama.
                        </div>
                        <div className="fs-6 fw-bold">
                          <a href="/blog" className="text-gray-700 text-hover-primary">Tim Konten</a>
                          <span className="text-muted"> on Mar 21 2024</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="card-xl-stretch mx-md-3">
                      <a
                        className="d-block bgi-no-repeat bgi-size-cover bgi-position-center card-rounded position-relative min-h-175px mb-5"
                        style={{ backgroundImage: "url('/images/tutorial-2.jpg')" }}
                        href="https://www.youtube.com/embed/btornGtLwIo"
                        target="_blank" rel="noreferrer"
                      >
                        <img src="/metronic/assets/media/svg/misc/video-play.svg" className="position-absolute top-50 start-50 translate-middle" alt="play" />
                      </a>
                      <div className="m-0">
                        <a href="https://youtu.be" target="_blank" rel="noreferrer" className="fs-4 text-gray-900 fw-bold text-hover-primary lh-base">
                          Atur Tamu & RSVP
                        </a>
                        <div className="fw-semibold fs-5 text-gray-600 my-4">
                          Impor kontak, broadcast undangan, dan pantau konfirmasi.
                        </div>
                        <div className="fs-6 fw-bold">
                          <a href="/blog" className="text-gray-700 text-hover-primary">Cris Morgan</a>
                          <span className="text-muted"> on Apr 14 2024</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="card-xl-stretch ms-md-6">
                      <a
                        className="d-block bgi-no-repeat bgi-size-cover bgi-position-center card-rounded position-relative min-h-175px mb-5"
                        style={{ backgroundImage: "url('/images/tutorial-3.jpg')" }}
                        href="https://www.youtube.com/embed/TWdDZYNqlg4"
                        target="_blank" rel="noreferrer"
                      >
                        <img src="/metronic/assets/media/svg/misc/video-play.svg" className="position-absolute top-50 start-50 translate-middle" alt="play" />
                      </a>
                      <div className="m-0">
                        <a href="https://youtu.be" target="_blank" rel="noreferrer" className="fs-4 text-gray-900 fw-bold text-hover-primary lh-base">
                          Kustomisasi Template
                        </a>
                        <div className="fw-semibold fs-5 text-gray-600 my-4">
                          Ubah warna, font, musik, dan blok konten sesuai kebutuhan.
                        </div>
                        <div className="fs-6 fw-bold">
                          <a href="/blog" className="text-gray-700 text-hover-primary">Carles Nilson</a>
                          <span className="text-muted"> on May 14 2024</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* end::Row */}
              </div>
              {/* end::Section (Video) */}

              {/* begin::Card (Social/Contact) */}
              <div className="card mb-4 bg-light text-center">
                <div className="card-body py-12">
                  <div className="mb-5 fw-bold">Butuh bantuan lanjut?</div>
                  <div className="d-flex flex-wrap justify-content-center gap-3">
                    <Link href="mailto:support@dreamslink.id" className="btn btn-primary px-6">Email Support</Link>
                    <Link href="https://wa.me/628113651127" className="btn btn-success px-6" target="_blank">WhatsApp</Link>
                  </div>
                </div>
              </div>
              {/* end::Card (Social/Contact) */}
            </div>
            {/* end::Body */}
          </div>
          {/* end::FAQ card */}
        {/* end::Container */}
      {/* end::Content */}
    </UserLayout>
  );
}
