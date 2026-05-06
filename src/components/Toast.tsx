"use client";

import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info" | "loading";

export interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
  duration?: number;
}

interface Props {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}

const TYPE_STYLES: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: { bg: "#dfffe0", border: "#0a0", icon: "✓" },
  error: { bg: "#ffe0e0", border: "#c00", icon: "!" },
  info: { bg: "#e0f0ff", border: "#06c", icon: "i" },
  loading: { bg: "#fffbe0", border: "#cc9900", icon: "⋯" },
};

export default function Toast({ toasts, onDismiss }: Props) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: 24,
        zIndex: 3000,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        maxWidth: 360,
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <ToastBox key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastBox({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: number) => void;
}) {
  const styles = TYPE_STYLES[toast.type];
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (toast.type === "loading") return;
    const dur = toast.duration ?? 4000;
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(toast.id), 200);
    }, dur);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <div
      style={{
        pointerEvents: "auto",
        background: styles.bg,
        border: "2px solid",
        borderColor: "#fff #404040 #404040 #fff",
        boxShadow: "2px 2px 0 rgba(0,0,0,0.2)",
        padding: "8px 12px",
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        fontFamily: '"MS Sans Serif", "Pixelify Sans", sans-serif',
        fontSize: 12,
        animation: exiting
          ? "slideUp 0.2s ease-in reverse"
          : "slideUp 0.3s ease-out",
        opacity: exiting ? 0 : 1,
        transition: "opacity 0.2s",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 20,
          height: 20,
          background: styles.border,
          color: "#fff",
          fontWeight: "bold",
          fontSize: 12,
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        {styles.icon}
      </span>
      <span style={{ flex: 1, lineHeight: 1.4 }}>{toast.message}</span>
      {toast.type !== "loading" && (
        <button
          type="button"
          onClick={() => {
            setExiting(true);
            setTimeout(() => onDismiss(toast.id), 200);
          }}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 14,
            color: "#666",
            padding: 0,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}