import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { templateList } from "../data/templates";

export default function PilihTemplate() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return; // <-- pastikan hanya jalan di client
    if (status === "loading") return;

    // --- CEK LOGIN GOOGLE/NextAuth ---
    if (session?.user?.email) {
      setUser(session.user);
      return;
    }

    // --- CEK LOGIN MANUAL ---
    const userLS = window.localStorage.getItem("user");
    if (userLS) {
      setUser(JSON.parse(userLS));
    } else {
      // JANGAN REDIRECT KECUALI mounted SUDAH TRUE DAN userLS BENAR2 KOSONG
      router.replace("/login");
    }
  }, [mounted, status, session, router]);

  if (!mounted) return null;
  if (!user) return <div className="p-10">Loading...</div>;

  // RESTRICT BY PAID (OPSIONAL)
  // if (user.status_pembayaran !== "paid") {
  //   router.replace("/dashboard");
  //   return null;
  // }

  return (
    <div className="max-w-4xl mx-auto mt-12 p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Pilih Tema Undangan</h1>
      <div className="grid md:grid-cols-3 gap-8">
        {templateList.map((tpl) => (
          <div key={tpl.slug} className="border rounded-xl p-4 shadow text-center flex flex-col items-center">
            <img src={tpl.thumbnail} alt={tpl.name} className="w-full h-48 object-cover rounded mb-4" />
            <h2 className="text-xl font-semibold mb-2">{tpl.name}</h2>
            <p className="mb-4">{tpl.description}</p>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded mt-auto"
              onClick={() => router.push(`/buat-undangan?template=${tpl.slug}`)}
            >
              Pilih Tema Ini
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
