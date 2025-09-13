// app/tentang/page.tsx
import Link from "next/link";
import Image from "next/image";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tentang Kami - Undangan Digital",
  description:
    "Penyedia layanan undangan digital premium dengan pengalaman lebih dari 5 tahun.",
};

// Stats data
const stats = [
  { number: "300+", label: "Template Desain" },
  { number: "2500+", label: "Pasangan Puas" },
  { number: "5+", label: "Tahun Pengalaman" },
  { number: "24/7", label: "Dukungan Pelanggan" },
];

// Team members data
const teamMembers = [
  {
    name: "Ahmad Rizki",
    role: "Founder & CEO",
    image: "/images/team/founder.jpg",
    description:
      "Berpengalaman 10 tahun di industri desain digital dan pernikahan.",
  },
  {
    name: "Sarah Amalia",
    role: "Creative Director",
    image: "/images/team/creative-director.jpg",
    description:
      "Background desain grafis dengan spesialisasi di typography dan layout.",
  },
  {
    name: "Budi Santoso",
    role: "Tech Lead",
    image: "/images/team/tech-lead.jpg",
    description:
      "Ahli pengembangan web dengan fokus pada user experience.",
  },
];

// Values data
const values = [
  {
    title: "Kreativitas",
    description:
      "Selalu berinovasi dalam setiap desain untuk memberikan yang terbaik.",
    icon: (
      <svg
        className="w-12 h-12 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
        />
      </svg>
    ),
  },
  {
    title: "Kualitas",
    description:
      "Mengutamakan kualitas dalam setiap aspek layanan kami.",
    icon: (
      <svg
        className="w-12 h-12 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M5 13l4 4L19 7"
        />
      </svg>
    ),
  },
  {
    title: "Kepuasan Pelanggan",
    description:
      "Memberikan pengalaman terbaik untuk setiap pelanggan.",
    icon: (
      <svg
        className="w-12 h-12 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
        />
      </svg>
    ),
  },
];

export default function About() {
  return (
    <>
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-b from-blue-600 to-blue-800 text-white">
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Tentang Kami</h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Mewujudkan Undangan Pernikahan Impian Anda Sejak 2018
            </p>
          </div>
        </div>
        <div className="absolute inset-0 bg-blue-900 opacity-10 pattern-dots"></div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Cerita Kami</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Berawal dari sebuah studio kecil di Jakarta pada tahun 2018, kami memulai perjalanan dengan visi sederhana:
                  membuat undangan pernikahan digital yang elegan dan mudah diakses oleh semua orang.
                </p>
                <p>
                  Seiring berjalannya waktu, kami terus berinovasi dan mengembangkan platform kami. Dari hanya beberapa template
                  sederhana, kini kami memiliki ratusan desain premium yang telah membantu ribuan pasangan mewujudkan
                  undangan pernikahan impian mereka.
                </p>
                <p>
                  Kami bangga telah melayani lebih dari 2.500 pasangan dan terus berkembang berkat kepercayaan dan dukungan
                  dari komunitas kami.
                </p>
              </div>
            </div>
            <div className="relative h-[400px] rounded-lg overflow-hidden shadow-xl">
              <Image
                src="/images/about/studio.jpg"
                alt="Studio kami"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: "cover" }}
                className="rounded-lg"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-6">Visi & Misi</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold text-blue-600 mb-4">Visi</h3>
              <p className="text-gray-600">
                Menjadi platform undangan pernikahan digital dan cetak terkemuka di Indonesia yang mengutamakan
                kualitas, kemudahan, dan keindahan.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold text-blue-600 mb-4">Misi</h3>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-blue-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Menyediakan ratusan template eksklusif dengan kemudahan kustomisasi secara real-time
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-blue-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Memberikan layanan pelanggan responsif 24/7
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-blue-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Menawarkan fitur preview langsung sebelum pembayaran
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-blue-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Menjamin kualitas cetak terbaik bagi yang membutuhkan layanan fisik
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Tim Kami</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Dibalik layar, tim kami bekerja keras untuk memberikan pengalaman terbaik bagi setiap pelanggan
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="relative h-64">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                  <p className="text-blue-600 mb-4">{member.role}</p>
                  <p className="text-gray-600">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Nilai-Nilai Kami</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Prinsip-prinsip yang kami pegang dalam memberikan layanan terbaik
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="text-center p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex justify-center mb-6">{value.icon}</div>
                <h3 className="text-xl font-bold mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Apa Kata Mereka</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Testimoni dari pasangan yang telah menggunakan layanan kami
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <p className="text-gray-600 italic mb-6">
                "Desain yang sangat elegan dan tim support yang sangat membantu. Terima kasih telah membuat
                undangan pernikahan kami menjadi lebih istimewa!"
              </p>
              <div className="flex items-center">
                <Image
                  src="/images/testimonials/couple1.jpg"
                  alt="Testimonial 1"
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div className="ml-4">
                  <p className="font-semibold">Andi & Sarah</p>
                  <p className="text-gray-500 text-sm">Jakarta</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <p className="text-gray-600 italic mb-6">
                "Proses pembuatan yang sangat mudah dan hasil akhir yang memuaskan. Recommended banget!"
              </p>
              <div className="flex items-center">
                <Image
                  src="/images/testimonials/couple2.jpg"
                  alt="Testimonial 2"
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div className="ml-4">
                  <p className="font-semibold">Budi & Maya</p>
                  <p className="text-gray-500 text-sm">Bandung</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <p className="text-gray-600 italic mb-6">
                "Fitur-fiturnya lengkap dan customizable. Tamu undangan kami sangat terkesan!"
              </p>
              <div className="flex items-center">
                <Image
                  src="/images/testimonials/couple3.jpg"
                  alt="Testimonial 3"
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div className="ml-4">
                  <p className="font-semibold">Reza & Linda</p>
                  <p className="text-gray-500 text-sm">Surabaya</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            Siap Membuat Undangan Pernikahan Digital Anda?
          </h2>
          <p className="text-xl text-blue-100 mb-12">
            Bergabunglah bersama 2.500+ pasangan yang telah mempercayakan undangan pernikahan mereka kepada kami
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pilih-template"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-full font-semibold text-lg transition duration-300"
            >
              Lihat Template
            </Link>
            <Link
              href="/kontak"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-full font-semibold text-lg transition duration-300"
            >
              Hubungi Kami
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
