"use client";

import { useEffect, useState } from "react";
import HeaderInfo from "./componnents/header-info";
import PresenceList from "./componnents/presence-list";
import BottomNav from "./componnents/BottomNav";
import styles from "./client-page.module.css";
import Link from "next/link";
import { IoArrowBack } from "react-icons/io5"; // ikon panah kiri
type Props = { slug: string };

export default function GuestbookClientPage({ slug }: Props) {
  const [invitationData, setInvitationData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/invitation/detail?slug=${slug}`);
        const json = await res.json();
        if (json?.undangan) {
          setInvitationData({
            title:
              json.undangan.title ||
              `${json.undangan?.mempelai?.pria || ""} & ${
                json.undangan?.mempelai?.wanita || ""
              }`,
            groomName: json.undangan?.mempelai?.pria || "Pria",
            brideName: json.undangan?.mempelai?.wanita || "Wanita",
            eventDate: json.undangan?.acara_utama?.tanggal || null,
            location: json.undangan?.acara_utama?.lokasi || "-",
            coverImage: json.undangan?.main_photo || "/default-cover.jpg",
          });
        }
      } catch (err) {
        console.error("Gagal fetch undangan:", err);
      }
    };

    fetchData();
  }, [slug]);

  if (!invitationData) {
    return <div className={styles.loading}>Memuat data undangan…</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <HeaderInfo data={invitationData} />
        <div className="mt-10">
        </div>
      </div>
{/* 🔙 Tombol kembali */}
        <div className="text-center my-8">
          <Link
            href={`/edit-undangan/${slug}`}
            className="inline-flex items-center gap-2 text-white hover:text-white text-base font-semibold bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-full transition duration-300 shadow-md"
          >
            <IoArrowBack className="text-lg" />
            Kembali ke Menu Edit Undangan
          </Link>
        </div>
      <BottomNav slug={slug} />
    </div>
  );
}
