"use client";

import { useState, useEffect } from "react";
import WelcomeScreen from "./welcome-screen";
import ConfirmModal from "./confirm-modal";
import Scanner from "./scanner";
import styles from "./view-client.module.css";
import BottomNav from "../componnents/BottomNav";

type Props = { slug: string };

export default function GuestbookViewClient({ slug }: Props) {
  const [invitationData, setInvitationData] = useState<any>(null);
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [pendingGuest, setPendingGuest] = useState("");
  const [jumlahHadir, setJumlahHadir] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeGuestName, setWelcomeGuestName] = useState("");
  const [toast, setToast] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const res = await fetch(`/api/invitation/detail?slug=${slug}`);
        const json = await res.json();
        if (json?.undangan) {
          setInvitationData({
            groomName: json.undangan?.mempelai?.pria || "Pria",
            brideName: json.undangan?.mempelai?.wanita || "Wanita",
            eventDate: json.undangan?.acara_utama?.tanggal || null,
            coverImage: json.undangan?.main_photo || "/default-cover.jpg",
          });
        }
      } catch (err) {
        console.error("Gagal mengambil data undangan:", err);
      }
    };
    fetchInvitation();
  }, [slug]);

  const handleSubmit = async (photoFile: File) => {
    if (!pendingGuest || jumlahHadir < 1 || !photoFile) {
      showToast("error", "Nama, jumlah, atau foto tidak valid");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("slug", slug);
      formData.append("guest", pendingGuest);
      formData.append("jumlah", jumlahHadir.toString());
      formData.append("photo", photoFile);

      const res = await fetch("/api/invitation/mark-attendance", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const json = await res
          .json()
          .catch(() => ({ message: "Gagal mencatat kehadiran" }));
        showToast("error", json.message);
        return;
      }

      setWelcomeGuestName(pendingGuest);
      setShowWelcome(true);
      setConfirmOpen(false);
      setPendingGuest("");
    } catch (err) {
      console.error(err);
      showToast("error", "Terjadi kesalahan jaringan");
    }
  };

  const showToast = (
    type: "success" | "error" | "info",
    message: string,
    duration = 2500
  ) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), duration);
  };

  const formattedDate = invitationData?.eventDate
    ? new Date(invitationData.eventDate).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const getToastClassName = () => {
    if (!toast) return "";
    const typeClass = {
      success: styles.toastSuccess,
      error: styles.toastError,
      info: styles.toastInfo,
    }[toast.type];
    return `${styles.toast} ${typeClass}`;
  };

  if (!invitationData) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#f3f4f6",
        }}
      >
        <p style={{ color: "#6b7280" }}>Loading Invitation...</p>
      </div>
    );
  }

  return (
    <>
      <div
        className={styles.heroSection}
        style={{ backgroundImage: `url(${invitationData.coverImage})` }}
      >
        <div className={styles.overlay} />
        <div className={styles.content}>
          <p className={styles.subtitle}>Our Wedding</p>
          <h1 className={styles.title}>
            {invitationData.groomName} & {invitationData.brideName}
          </h1>
          <p className={styles.date}>{formattedDate}</p>
          <button
            onClick={() => setIsScanOpen(true)}
            className={styles.scanButton}
          >
            SCAN QR
          </button>
        </div>

        {/* ✅ FIX: pakai slug, bukan navItems manual */}
        <BottomNav slug={slug} />
      </div>

      {isScanOpen && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupCard}>
            <div className={styles.popupHeader}>
              <h3 className={styles.popupTitle}>Scan QR Code Tamu</h3>
              <button
                onClick={() => setIsScanOpen(false)}
                className={styles.popupCloseButton}
              >
                ✕
              </button>
            </div>
            <div className={styles.popupContent}>
              <Scanner
                slug={slug}
                onSuccess={(guestName) => {
                  setPendingGuest(guestName);
                  setJumlahHadir(1);
                  setConfirmOpen(true);
                  setIsScanOpen(false);
                }}
                onInvalid={(msg) => {
                  showToast("error", msg);
                  setIsScanOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {confirmOpen && (
        <ConfirmModal
          pendingGuest={pendingGuest}
          jumlahHadir={jumlahHadir}
          setJumlahHadir={setJumlahHadir}
          onCancel={() => {
            setConfirmOpen(false);
            setPendingGuest("");
            setIsScanOpen(true);
          }}
          onSubmit={handleSubmit}
        />
      )}

      {showWelcome && (
        <WelcomeScreen
          guestName={welcomeGuestName}
          onFinish={() => setShowWelcome(false)}
        />
      )}

      {toast && (
        <div className={styles.toastContainer}>
          <div className={getToastClassName()}>{toast.message}</div>
        </div>
      )}
    </>
  );
}
