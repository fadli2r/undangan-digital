"use client";

import { useEffect } from "react";

type ToastType = "success" | "error" | "info";

export type ToastProps = {
  type: ToastType;
  message: string;
  onClose?: () => void;
  duration?: number;
};

export default function Toast({ type, message, onClose, duration = 2500 }: ToastProps) {
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timeout);
  }, [onClose, duration]);

  const bgColor =
    type === "success"
      ? "bg-green-600"
      : type === "error"
      ? "bg-red-600"
      : "bg-blue-600";

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50">
      <div className="max-w-md mx-auto px-4">
        <div
          className={`rounded-xl px-4 py-3 shadow-lg text-sm font-medium text-white ${bgColor}`}
        >
          {message}
        </div>
      </div>
    </div>
  );
}
