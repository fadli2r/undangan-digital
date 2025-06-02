import React from 'react';

export default function AddToCalendar({ event }) {
  if (!event || !event.tanggal || !event.waktu) {
    return null;
  }
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().replace(/-|:|\.\d\d\d/g, '');
  };

  const generateGoogleCalendarUrl = () => {
    try {
      const { nama, tanggal, waktu, lokasi, alamat } = event;
      
      // Parse waktu (time) from format "19:00 WIB" to get hours and minutes
      const [time = "00:00", timezone = ""] = (waktu || "").split(' ');
      const [hours = "0", minutes = "0"] = time.split(':');
      
      // Create start and end dates
      const startDate = new Date(tanggal);
      if (isNaN(startDate.getTime())) {
        return '#';
      }

      startDate.setHours(parseInt(hours), parseInt(minutes), 0);
      
      const endDate = new Date(startDate);
      endDate.setHours(startDate.getHours() + 3); // Default duration: 3 hours
      
      const params = {
        action: 'TEMPLATE',
        text: nama || 'Undangan Pernikahan',
        dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
        details: `Acara: ${nama || ''}\\nLokasi: ${lokasi || ''}\\nAlamat: ${alamat || ''}`,
        location: `${lokasi || ''}, ${alamat || ''}`,
      };

      const baseUrl = 'https://calendar.google.com/calendar/render';
      const queryString = Object.keys(params)
        .map(key => `${key}=${encodeURIComponent(params[key])}`)
        .join('&');

      return `${baseUrl}?${queryString}`;
    } catch (error) {
      console.error('Error generating calendar URL:', error);
      return '#';
    }
  };


}
