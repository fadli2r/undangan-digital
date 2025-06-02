import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function ListRSVP() {
  const router = useRouter();
  const { slug } = router.query;
  const [rsvpList, setRsvpList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/invitation/detail?slug=${slug}`)
      .then(res => res.json())
      .then(res => {
        setRsvpList(res.undangan?.rsvp || []);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <div>Loading...</div>;
  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Daftar RSVP</h2>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">Nama</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Jumlah</th>
            <th className="border p-2">Waktu</th>
          </tr>
        </thead>
        <tbody>
          {rsvpList.length === 0 && (
            <tr><td colSpan={4} className="p-2 text-center">Belum ada RSVP</td></tr>
          )}
          {rsvpList.map((r, i) => (
            <tr key={i}>
              <td className="border p-2">{r.nama}</td>
              <td className="border p-2">{r.status}</td>
              <td className="border p-2">{r.jumlah}</td>
              <td className="border p-2">{new Date(r.waktu).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
