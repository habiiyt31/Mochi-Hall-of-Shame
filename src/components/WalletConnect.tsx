"use client";

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

/**
 * Win98-style wallet connect bar shown at the top of the app.
 * Works with MetaMask, Rabby, Coinbase Wallet, or any EIP-1193 browser wallet.
 */
export default function WalletConnect({ wallet }: Props) {
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
      }}
    >
      {/* Taskbar left: logo */}
      <span style={{ fontWeight: "bold", fontSize: 13 }}>
        Mochi Hall of Shame
      </span>

      <div style={{ flex: 1 }} />

      {wallet.error && (
        <span style={{ color: "#c00", fontSize: 11 }}>{wallet.error}</span>
      )}

      {wallet.connected && wallet.address ? (
        <>
          {/* Green LED */}
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#0a0",
              boxShadow: "0 0 4px #0a0",
            }}
          />
          <span style={{ fontFamily: "monospace", fontSize: 11 }}>
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
          style={{ ...btn, background: wallet.connecting ? "#aaa" : "#c0c0c0" }}
        >
          {wallet.connecting ? "Connecting..." : "Connect Wallet"}
        </button>
      )}
    </div>
  );
}
