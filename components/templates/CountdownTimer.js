import { useState, useEffect } from 'react';

export default function CountdownTimer({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }
      
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      };
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Cleanup interval on unmount
    return () => clearInterval(timer);
  }, [targetDate]);

  // Don't render if no target date
  if (!targetDate) return null;

  return (
    <div className="flex justify-center gap-4 text-center">
      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 min-w-[80px] shadow-lg">
        <div className="text-3xl font-bold">{timeLeft.days}</div>
        <div className="text-sm text-gray-600">Hari</div>
      </div>
      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 min-w-[80px] shadow-lg">
        <div className="text-3xl font-bold">{timeLeft.hours}</div>
        <div className="text-sm text-gray-600">Jam</div>
      </div>
      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 min-w-[80px] shadow-lg">
        <div className="text-3xl font-bold">{timeLeft.minutes}</div>
        <div className="text-sm text-gray-600">Menit</div>
      </div>
      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 min-w-[80px] shadow-lg">
        <div className="text-3xl font-bold">{timeLeft.seconds}</div>
        <div className="text-sm text-gray-600">Detik</div>
      </div>
    </div>
  );
}
