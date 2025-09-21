import React, { useEffect } from "react";

export default function FlashMessage({ message, type = "success", onClose, customButtons }) {
  const bgColors = {
    success: "rgba(34, 197, 94, 0.3)", // green
    error: "rgba(239, 68, 68, 0.3)",   // red
    info: "rgba(59, 130, 246, 0.3)",   // blue
  };

  // Auto close after 3 seconds (only if no buttons)
  useEffect(() => {
    if (!customButtons) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [customButtons, onClose]);

  return (
    <div
      className="fixed bottom-6 right-0 transform -translate-x-1/2 animate-slideUp z-50 flex items-center gap-4 px-6 py-3 rounded-lg shadow-lg border border-white/20 backdrop-blur-md"
      style={{
        backgroundColor: bgColors[type],
        color: "white",
        minWidth: "250px",
      }}
    >
      <span className="font-medium">{message}</span>
      {customButtons}
      {!customButtons && (
        <button
          onClick={onClose}
          className="font-bold bg-transparent border-none text-white text-lg cursor-pointer"
        >
          ×
        </button>
      )}
    </div>
  );
}
