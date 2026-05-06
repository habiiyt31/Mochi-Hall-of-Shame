"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { MochiMood } from "@/types/contract";

const MOOD_FILTER: Record<MochiMood, string> = {
  happy: "hue-rotate(0deg) saturate(1.2) brightness(1.05)",
  smug: "hue-rotate(0deg)",
  low_battery: "grayscale(0.6) brightness(0.9)",
  angry: "hue-rotate(-90deg) saturate(1.5) brightness(1.1)",
};

interface Props {
  message?: string | null;
  mood?: MochiMood;
  onClick?: () => void;
}

export default function MochiAssistant({
  message,
  mood = "smug",
  onClick,
}: Props) {
  const [visible, setVisible] = useState(true);
  const [bubble, setBubble] = useState(message);

  useEffect(() => {
    setBubble(message);
  }, [message]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        right: 20,
        bottom: 20,
        zIndex: 1500,
        display: "flex",
        alignItems: "flex-end",
        gap: 8,
        pointerEvents: "none",
      }}
    >
      {bubble && (
        <div
          style={{
            pointerEvents: "auto",
            position: "relative",
            background: "#ffffe1",
            border: "1px solid #000",
            padding: "10px 14px",
            maxWidth: 280,
            fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
            fontSize: 13,
            color: "#000",
            boxShadow: "3px 3px 0 rgba(0,0,0,0.4)",
            marginBottom: 30,
            animation: "slideUp 0.3s ease-out",
            lineHeight: 1.4,
          }}
        >
          {bubble}
          <div
            style={{
              position: "absolute",
              right: -10,
              bottom: 14,
              width: 0,
              height: 0,
              borderTop: "8px solid transparent",
              borderBottom: "8px solid transparent",
              borderLeft: "10px solid #ffffe1",
            }}
          />
          <button
            type="button"
            onClick={() => setBubble(null)}
            style={{
              position: "absolute",
              top: 2,
              right: 4,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              color: "#888",
              lineHeight: 1,
            }}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      <div style={{ position: "relative", pointerEvents: "auto" }}>
        <div
          onClick={onClick}
          style={{
            position: "relative",
            width: 88,
            height: 88,
            cursor: "pointer",
            animation: "float 2.5s ease-in-out infinite",
            filter: MOOD_FILTER[mood],
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
          title="Click Mochi"
        >
          <Image
            src="/mochi.png"
            alt="Mochi"
            fill
            sizes="88px"
            style={{
              mixBlendMode: "screen",
              filter: "drop-shadow(0 0 10px rgba(255,0,200,0.7))",
              objectFit: "contain",
              imageRendering: "pixelated",
            }}
            priority
            draggable={false}
          />
        </div>

        <button
          type="button"
          onClick={() => setVisible(false)}
          style={{
            position: "absolute",
            top: -2,
            right: -2,
            width: 18,
            height: 18,
            background: "#c0c0c0",
            border: "1px solid",
            borderColor: "#fff #404040 #404040 #fff",
            fontSize: 12,
            fontWeight: "bold",
            cursor: "pointer",
            padding: 0,
            lineHeight: "14px",
          }}
          title="Hide Mochi"
        >
          ×
        </button>
      </div>
    </div>
  );
}