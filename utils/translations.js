export const translations = {
  id: {
    // Common UI elements
    back: "Kembali",
    save: "Simpan",
    edit: "Edit",
    delete: "Hapus",
    loading: "Memuat...",
    success: "Berhasil",
    error: "Error",
    active: "Aktif",
    inactive: "Tidak Aktif",
    template: "Template",

    // Navigation Menu
    ubah_desain: "Ubah Desain",
    informasi_mempelai: "Informasi Mempelai",
    informasi_acara: "Informasi Acara",
    informasi_tambahan: "Informasi Tambahan",
    amplop_digital: "Amplop Digital",
    kelola_tamu: "Kelola Tamu",
    pengaturan_privasi: "Pengaturan Privasi",
    download_export: "Download & Export",

    // Dashboard
    summary_data: "Ringkasan Data",
    invitation_stats: "Statistik Undangan",
    open_qr_scanner: "Buka Scanner QR Code Tamu",
    
    // Wedding specific
    wedding_invitation: "Undangan Pernikahan",
    groom: "Mempelai Pria",
    bride: "Mempelai Wanita",
    wedding_date: "Tanggal Pernikahan",
    location: "Lokasi",
    address: "Alamat",
    save_date: "Simpan Tanggal",
    
    // RSVP
    rsvp: "Konfirmasi Kehadiran",
    attending: "Hadir",
    not_attending: "Tidak Hadir",
    maybe: "Mungkin Hadir",
    number_of_guests: "Jumlah Tamu",
    
    // Wishes
    send_wishes: "Kirim Ucapan",
    your_name: "Nama Anda",
    your_message: "Pesan Anda",
    submit: "Kirim",
    
    // Events
    ceremony: "Akad Nikah",
    reception: "Resepsi",
    
    // Digital Gift
    digital_envelope: "Amplop Digital",
    send_gift: "Kirim Hadiah",
    bank_transfer: "Transfer Bank",
    e_wallet: "E-Wallet",
    
    // Features
    gallery: "Galeri",
    story: "Cerita Kami",
    music: "Musik",
    live_streaming: "Live Streaming",
    
    // Guest Management
    guest_list: "Daftar Tamu",
    add_guest: "Tambah Tamu",
    edit_guest: "Edit Tamu",
    guest_name: "Nama Tamu",
    guest_email: "Email Tamu",
    guest_phone: "Nomor Telepon",
    
    // Privacy
    privacy_settings: "Pengaturan Privasi",
    password_protection: "Proteksi Password",
    hide_guestbook: "Sembunyikan Buku Tamu",
    hide_rsvp: "Sembunyikan RSVP",
    
    // Download
    download: "Unduh",
    export: "Ekspor",
    download_pdf: "Unduh PDF",
    export_guest_list: "Ekspor Daftar Tamu",
    export_wishes: "Ekspor Ucapan"
  },
  en: {
    // Common UI elements
    back: "Back",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
    loading: "Loading...",
    success: "Success",
    error: "Error",
    active: "Active",
    inactive: "Inactive",
    template: "Template",

    // Navigation Menu
    ubah_desain: "Change Design",
    informasi_mempelai: "Couple Information",
    informasi_acara: "Event Information",
    informasi_tambahan: "Additional Information",
    amplop_digital: "Digital Envelope",
    kelola_tamu: "Guest Management",
    pengaturan_privasi: "Privacy Settings",
    download_export: "Download & Export",

    // Dashboard
    summary_data: "Summary Data",
    invitation_stats: "Invitation Statistics",
    open_qr_scanner: "Open Guest QR Scanner",
    
    // Wedding specific
    wedding_invitation: "Wedding Invitation",
    groom: "Groom",
    bride: "Bride",
    wedding_date: "Wedding Date",
    location: "Location",
    address: "Address",
    save_date: "Save the Date",
    
    // RSVP
    rsvp: "RSVP",
    attending: "Attending",
    not_attending: "Not Attending",
    maybe: "Maybe",
    number_of_guests: "Number of Guests",
    
    // Wishes
    send_wishes: "Send Wishes",
    your_name: "Your Name",
    your_message: "Your Message",
    submit: "Submit",
    
    // Events
    ceremony: "Ceremony",
    reception: "Reception",
    
    // Digital Gift
    digital_envelope: "Digital Envelope",
    send_gift: "Send Gift",
    bank_transfer: "Bank Transfer",
    e_wallet: "E-Wallet",
    
    // Features
    gallery: "Gallery",
    story: "Our Story",
    music: "Music",
    live_streaming: "Live Streaming",
    
    // Guest Management
    guest_list: "Guest List",
    add_guest: "Add Guest",
    edit_guest: "Edit Guest",
    guest_name: "Guest Name",
    guest_email: "Guest Email",
    guest_phone: "Phone Number",
    
    // Privacy
    privacy_settings: "Privacy Settings",
    password_protection: "Password Protection",
    hide_guestbook: "Hide Guestbook",
    hide_rsvp: "Hide RSVP",
    
    // Download
    download: "Download",
    export: "Export",
    download_pdf: "Download PDF",
    export_guest_list: "Export Guest List",
    export_wishes: "Export Wishes"
  }
};

export const getDefaultLanguage = () => {
  if (typeof window === 'undefined') return 'id';
  
  // Get browser language
  const browserLang = navigator.language.toLowerCase();
  
  // Check if browser language is Indonesian
  if (browserLang.startsWith('id')) {
    return 'id';
  }
  
  // Default to English for non-Indonesian browsers
  return 'en';
};

export const translate = (key, lang) => {
  const language = lang || getDefaultLanguage();
  return translations[language]?.[key] || translations.id[key] || key;
};
