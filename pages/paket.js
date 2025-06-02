import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Header from "../components/Header";

const paketList = [
  {
    id: "basic",
    nama: "Basic",
    harga: 25000,
    fitur: [
      "1 Template Undangan",
      "RSVP Digital",
      "Galeri Foto",
      "Amplop Digital"
    ]
  },
  {
    id: "premium",
    nama: "Premium",
    harga: 50000,
    fitur: [
      "Semua Fitur Basic",
      "15 Galeri Foto",
      "Pilih Template Premium",
      "Countdown, Musik, Maps",
      "Live Streaming"
    ]
  }
];

export default function Paket() {
  const { data: session } = useSession();
  const router = useRouter();

  const handlePilihPaket = (paket) => {
    // Redirect to summary page with selected paketId
    router.push(`/paket/summary?paketId=${paket.id}`);
  };

  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto mt-10 p-6">
        <h1 className="text-3xl font-bold mb-8 text-center">Pilih Paket Undangan</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {paketList.map((paket) => (
            <div 
              key={paket.id} 
              className="border rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              {/* Header */}
              <div className={`p-6 text-center ${paket.id === 'premium' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' : 'bg-gray-50'}`}>
                <h2 className="text-2xl font-bold mb-2">{paket.nama}</h2>
                <div className="text-3xl font-mono">
                  Rp{paket.harga.toLocaleString()}
                </div>
              </div>

              {/* Features */}
              <div className="p-6 space-y-4">
                <ul className="space-y-3">
                  {paket.fitur.map((fitur, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <svg className={`w-5 h-5 mt-0.5 ${paket.id === 'premium' ? 'text-blue-600' : 'text-green-600'}`} 
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{fitur}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePilihPaket(paket)}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    paket.id === 'premium'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Pilih Paket
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-12 text-center text-gray-600">
          <p className="mb-2">Butuh bantuan? Hubungi kami di:</p>
          <a href="https://wa.me/your-number" target="_blank" rel="noopener noreferrer" 
            className="text-blue-600 hover:underline">
            WhatsApp Support
          </a>
        </div>
      </div>
    </>
  );
}
