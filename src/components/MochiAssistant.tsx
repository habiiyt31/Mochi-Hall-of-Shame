"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { MochiMood } from "@/types/contract";

const MOOD_FILTER: Record<MochiMood, string> = {
  happy: "hue-rotate(0deg) saturate(1.2)",
  smug: "hue-rotate(0deg)",
  low_battery: "grayscale(0.6) brightness(0.9)",
  angry: "hue-rotate(-90deg) saturate(1.5)",
};

interface Props {
  message?: string | null;
  mood?: MochiMood;
  onClick?: () => void;
}

export default function MochiAssistant({ message, mood = "smug", onClick }: Props) {
  const [visible, setVisible] = useState(true);
  const [bubble, setBubble] = useState(message);

  useEffect(() => setBubble(message), [message]);

  if (!visible) return null;

  return (
    <div style={{ position: "fixed", right: 24, bottom: 24, zIndex: 1000, display: "flex", alignItems: "flex-end", gap: 8, pointerEvents: "none" }}>
      {bubble && (
        <div style={{ pointerEvents: "auto", position: "relative", background: "#ffffe1", border: "1px solid #000", padding: "8px 12px", maxWidth: 260, fontFamily: '"Comic Sans MS",cursive', fontSize: 13, boxShadow: "2px 2px 0 #000", marginBottom: 30 }}>
          {bubble}
          {/* speech bubble tail */}
          <div style={{ position: "absolute", right: -10, bottom: 12, width: 0, height: 0, borderTop: "8px solid transparent", borderBottom: "8px solid transparent", borderLeft: "10px solid #ffffe1" }} />
          <button type="button" onClick={() => setBubble(null)} style={{ position: "absolute", top: 2, right: 2, background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#888" }}>x</button>
        </div>
      )}

      <div style={{ pointerEvents: "auto", position: "relative", width: 96, height: 96, cursor: "pointer", animation: "mochiBob 2s ease-in-out infinite", filter: MOOD_FILTER[mood] }} onClick={onClick} title="Click Mochi">
        <Image src="/mochi.png" alt="Mochi" fill sizes="96px" style={{ objectFit: "contain", imageRendering: "pixelated", filter: "drop-shadow(0 0 8px rgba(255,0,200,0.6))" }} priority draggable={false} />
      </div>

      <button type="button" onClick={() => setVisible(false)} style={{ pointerEvents: "auto", position: "absolute", right: -4, bottom: -4, width: 18, height: 18, background: "#c0c0c0", border: "1px solid", borderColor: "#fff #404040 #404040 #fff", fontSize: 12, fontWeight: "bold", cursor: "pointer", padding: 0 }} title="Hide Mochi">x</button>

      <style>{`@keyframes mochiBob{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-6px) rotate(2deg)}}`}</style>
    </div>
  );
}
