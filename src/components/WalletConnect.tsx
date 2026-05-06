"use client";

import { useEffect, useState } from "react";
import type { WalletState } from "@/hooks/useWallet";

interface Props {
  wallet: WalletState & { connect: () => void; disconnect: () => void };
}

const btn: React.CSSProperties = {
  padding: "4px 14px",
  background: "#c0c0c0",
  border: "2px solid",
  borderColor: "#fff #404040 #404040 #fff",
  fontFamily: "inherit",
  fontSize: 12,
  fontWeight: "bold",
  cursor: "pointer",
};

export default function WalletConnect({ wallet }: Props) {
  const [time, setTime] = useState("");

  useEffect(() => {
    function update() {
      const d = new Date();
      setTime(
        `${String(d.getHours()).padStart(2, "0")}:${String(
          d.getMinutes()
        ).padStart(2, "0")}`
      );
    }
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 2000,
        background: "#c0c0c0",
        borderBottom: "2px solid",
        borderColor: "#fff #404040 #404040 #fff",
        padding: "4px 12px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        fontFamily: '"MS Sans Serif","Pixelify Sans",sans-serif',
        fontSize: 12,
        boxShadow: "0 2px 0 rgba(0,0,0,0.2)",
      }}
    >
      <span style={{ fontWeight: "bold", fontSize: 13 }}>
        Mochi Hall of Shame
      </span>

      <div style={{ flex: 1 }} />

      {wallet.error && (
        <span style={{ color: "#c00", fontSize: 11, maxWidth: 240 }}>
          {wallet.error}
        </span>
      )}

      {wallet.connected && wallet.address ? (
        <>
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#0a0",
              boxShadow: "0 0 6px #0a0",
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 11,
              padding: "2px 6px",
              background: "#fff",
              border: "1px solid",
              borderColor: "#404040 #fff #fff #404040",
            }}
          >
            {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
          </span>
          <button type="button" onClick={wallet.disconnect} style={btn}>
            Disconnect
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={wallet.connect}
          disabled={wallet.connecting}
          style={{
            ...btn,
            background: wallet.connecting ? "#aaa" : "#c0c0c0",
            cursor: wallet.connecting ? "wait" : "pointer",
          }}
        >
          {wallet.connecting ? "Connecting..." : "Connect Wallet"}
        </button>
      )}

      <div
        style={{
          padding: "2px 8px",
          background: "#c0c0c0",
          border: "1px solid",
          borderColor: "#404040 #fff #fff #404040",
          fontSize: 11,
          fontFamily: "monospace",
        }}
      >
        {time}
      </div>
    </div>
  );
}