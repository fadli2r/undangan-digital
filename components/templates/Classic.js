import Image from 'next/image';
import GiftConfirmation from './GiftConfirmation';
import MusicPlayer from './MusicPlayer';
import CountdownTimer from './CountdownTimer';
import Maps from './Maps';
import RSVPForm from './RSVPForm';

export default function ClassicTemplate({ data }) {
  // Function to get color name or hex
  const getColorDisplay = (hexColor) => {
    if (!hexColor) return '#000000';
    const color = hexColor.replace('#', '');
    return color.length > 6 ? color : `#${color}`;
  };

  return (
    <div className="font-serif relative">
      <MusicPlayer musik={data.tambahan?.musik} />

      {/* Location Section */}
      {data.tambahan?.maps_url && (
        <section className="py-16 px-8 bg-gray-50">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">Lokasi Acara</h2>
            <Maps url={data.tambahan.maps_url} />
          </div>
        </section>
      )}

      {/* Countdown Timer */}
      {data.acara_utama?.tanggal && (
        <section className="py-8 px-8 bg-white/80 backdrop-blur-sm rounded-lg max-w-md mx-auto my-8 shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Hitung Mundur Acara</h2>
          <CountdownTimer targetDate={data.acara_utama.tanggal} />
        </section>
      )}

      {/* Digital Gift Section */}
      {data.gift?.enabled && (
        <section className="py-16 px-8 bg-gray-50">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">Amplop Digital</h2>
            
            {/* Bank Accounts */}
            {data.gift.bank_accounts?.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">Rekening Bank</h3>
                <div className="grid gap-4">
                  {data.gift.bank_accounts.map((account, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex items-center justify-center gap-3 mb-2">
                        {account.logo && (
                          <Image
                            src={account.logo}
                            alt={account.bank}
                            width={32}
                            height={32}
                            className="object-contain"
                          />
                        )}
                        <span className="font-bold">{account.bank}</span>
                      </div>
                      <div className="font-mono text-lg mb-1">{account.nomor}</div>
                      <div className="text-gray-600">a.n. {account.atas_nama}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* E-Wallets */}
            {data.gift.e_wallets?.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">E-Wallet</h3>
                <div className="grid gap-4">
                  {data.gift.e_wallets.map((wallet, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex items-center justify-center gap-3 mb-2">
                        {wallet.logo && (
                          <Image
                            src={wallet.logo}
                            alt={wallet.nama}
                            width={32}
                            height={32}
                            className="object-contain"
                          />
                        )}
                        <span className="font-bold">{wallet.nama}</span>
                      </div>
                      <div className="font-mono text-lg mb-1">{wallet.nomor}</div>
                      {wallet.qr_code && (
                        <div className="mt-2">
                          <Image
                            src={wallet.qr_code}
                            alt={`${wallet.nama} QR Code`}
                            width={200}
                            height={200}
                            className="mx-auto"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* QRIS */}
            {data.gift.qris?.enabled && data.gift.qris.image_url && (
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">QRIS</h3>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  {data.gift.qris.merchant_name && (
                    <div className="mb-2">{data.gift.qris.merchant_name}</div>
                  )}
                  <Image
                    src={data.gift.qris.image_url}
                    alt="QRIS Code"
                    width={200}
                    height={200}
                    className="mx-auto"
                  />
                  <div className="text-sm text-gray-500 mt-2">
                    Scan QRIS untuk pembayaran melalui semua e-wallet dan mobile banking
                  </div>
                </div>
              </div>
            )}

            {/* Gift Confirmation Form */}
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4">Konfirmasi Hadiah</h3>
              <GiftConfirmation slug={data.slug} />
            </div>
          </div>
        </section>
      )}

      {/* RSVP Section */}
      <section className="py-16 px-8 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Konfirmasi Kehadiran (RSVP)</h2>
          <RSVPForm slug={data.slug} />
        </div>
      </section>
    </div>
  );
}
