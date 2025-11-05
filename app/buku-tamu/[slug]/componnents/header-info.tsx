"use client";

type Props = {
  data: {
    title: string;
    brideName: string;
    groomName: string;
    eventDate?: string;
    location?: string;
    coverImage?: string;
  };
  showScanButton?: boolean;
  onScanClick?: () => void;
};

export default function HeaderInfo({ data, showScanButton, onScanClick }: Props) {
  const {
    title,
    brideName,
    groomName,
    eventDate,
    location = "Lokasi belum ditentukan",
    coverImage = "/default-cover.jpg",
  } = data;

  const formattedDate = eventDate
    ? new Date(eventDate).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Tanggal belum ditentukan";

  return (
    <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow overflow-hidden ring-1 ring-gray-200 dark:ring-gray-800 mb-8">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Foto pengantin */}
        <div className="h-64 md:h-full w-full relative">
          <img
            src={coverImage}
            alt="Foto pengantin"
            className="object-cover w-full h-full"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/default-cover.jpg";
            }}
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* Info acara */}
        <div className="p-6 flex flex-col justify-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-1">
            {brideName} ❤️ {groomName}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">📅 {formattedDate}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">📍 {location}</p>

          {showScanButton && (
            <button
              onClick={onScanClick}
              className="mt-4 px-4 py-2 w-fit rounded-full bg-black text-white font-semibold hover:bg-gray-800 transition"
            >
              SCAN QR
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
