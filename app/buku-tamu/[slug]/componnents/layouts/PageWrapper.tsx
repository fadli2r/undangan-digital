"use client";

import React from "react";

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* konten utama, kasih padding bawah biar gak ketimpa BottomNav */}
      <main className="flex-1 pb-20">{children}</main>
    </div>
  );
}
