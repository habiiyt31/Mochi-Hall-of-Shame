"use client";

import { useEffect, useState } from "react";

export interface TaskbarWindow {
  id: string;
  title: string;
  minimized: boolean;
  active: boolean;
}

interface Props {
  windows: TaskbarWindow[];
  onClickTask: (id: string) => void;
  walletAddress: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  connecting: boolean;
}

function StartMenuItem({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%",
        padding: "6px 12px",
        background: hovered ? "#000080" : "none",
        border: "none",
        cursor: "pointer",
        fontSize: 12,
        fontFamily: '"MS Sans Serif","Pixelify Sans",sans-serif',
        textAlign: "left",
        color: hovered ? "#fff" : "#000",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span style={{ fontSize: 16, width: 22, textAlign: "center", flexShrink: 0 }}>
        {icon}
      </span>
      {label}
    </button>
  );
}

export default function Taskbar({
  windows,
  onClickTask,
  walletAddress,
  onConnect,
  onDisconnect,
  connecting,
}: Props) {
  const [time, setTime] = useState("");
  const [showDisconnect, setShowDisconnect] = useState(false);
  const [showStart, setShowStart] = useState(false);

  useEffect(() => {
    function update() {
      const d = new Date();
      setTime(
        `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
      );
    }
    update();
    const id = setInterval(update, 10000);
    return () => clearInterval(id);
  }, []);

  // Close start menu when clicking outside
  useEffect(() => {
    if (!showStart) return;
    function handleClick() { setShowStart(false); }
    setTimeout(() => window.addEventListener("click", handleClick), 0);
    return () => window.removeEventListener("click", handleClick);
  }, [showStart]);

  const taskBtn = (active: boolean, minimized: boolean): React.CSSProperties => ({
    height: 28,
    padding: "0 10px",
    maxWidth: 150,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    background: minimized
      ? "#aaa"
      : active
      ? "linear-gradient(180deg,#aaa,#c0c0c0)"
      : "linear-gradient(180deg,#c0c0c0,#aaa)",
    border: "2px solid",
    borderColor: minimized || active
      ? "#404040 #fff #fff #404040"
      : "#fff #404040 #404040 #fff",
    fontFamily: '"MS Sans Serif","Pixelify Sans",sans-serif',
    fontSize: 11,
    fontWeight: "bold",
    cursor: "pointer",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    gap: 4,
  });

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 40,
        zIndex: 9000,
        background: "linear-gradient(180deg,#1c5aaf 0%,#1444a0 50%,#1c5aaf 100%)",
        borderTop: "2px solid #2a7ad4",
        display: "flex",
        alignItems: "center",
        padding: "0 2px",
        gap: 2,
        boxShadow: "0 -1px 0 rgba(255,255,255,0.15) inset",
      }}
    >
      {/* Start button + popup */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setShowStart((s) => !s); }}
          style={{
            height: 36,
            padding: "0 14px 0 6px",
            background: showStart
              ? "linear-gradient(180deg,#3e8c3e,#5cb85c)"
              : "linear-gradient(180deg,#5cb85c,#3e8c3e 50%,#5cb85c)",
            border: "1px solid #2a6a2a",
            borderRadius: 14,
            color: "#fff",
            fontWeight: "bold",
            fontSize: 14,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontFamily: '"MS Sans Serif","Pixelify Sans",sans-serif',
            boxShadow: showStart
              ? "0 1px 0 rgba(0,0,0,0.3) inset"
              : "0 1px 0 rgba(255,255,255,0.3) inset",
            letterSpacing: 0.5,
          }}
        >
          <img
            src="/mochi.png"
            alt=""
            style={{ width: 24, height: 24, objectFit: "contain"}}
          />
          start
        </button>

        {/* Start menu popup */}
        {showStart && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              bottom: 40,
              left: 0,
              width: 230,
              background: "#c0c0c0",
              border: "2px solid",
              borderColor: "#fff #404040 #404040 #fff",
              boxShadow: "3px 3px 6px rgba(0,0,0,0.4)",
              zIndex: 9999,
            }}
          >
            {/* Header */}
            <div style={{
              background: "linear-gradient(180deg,#000080,#1084d0)",
              color: "#fff",
              padding: "10px 10px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}>
              <img
                src="/mochi.png"
                alt="Mochi"
                style={{ width: 40, height: 40, objectFit: "contain" }}
              />
              <div>
                <div style={{ fontWeight: "bold", fontSize: 13 }}>Mochi Hall of Shame</div>
                <div style={{ fontSize: 10, opacity: 0.8 }}>
                  {walletAddress
                    ? `${walletAddress.slice(0, 8)}...${walletAddress.slice(-4)}`
                    : "Not connected"}
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div style={{ padding: "4px 0" }}>
              {/* Wallet */}
              <StartMenuItem
                icon={walletAddress ? "🔴" : "🔑"}
                label={walletAddress ? "Disconnect Wallet" : "Connect Wallet"}
                onClick={() => {
                  walletAddress ? onDisconnect() : onConnect();
                  setShowStart(false);
                }}
              />

              <div style={{ height: 1, background: "#aaa", margin: "4px 8px" }} />

              {/* Window shortcuts */}
              {windows.map((w) => (
                <StartMenuItem
                  key={w.id}
                  icon="🪟"
                  label={w.title}
                  onClick={() => { onClickTask(w.id); setShowStart(false); }}
                />
              ))}

              <div style={{ height: 1, background: "#aaa", margin: "4px 8px" }} />

              <StartMenuItem
                icon="🌐"
                label="GenLayer Docs"
                onClick={() => {
                  window.open("https://docs.genlayer.com", "_blank");
                  setShowStart(false);
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.2)", margin: "0 2px", flexShrink: 0 }} />

      {/* Window task buttons */}
      <div style={{ flex: 1, display: "flex", gap: 3, overflow: "hidden", alignItems: "center", minWidth: 0 }}>
        {windows.map((w) => (
          <button
            key={w.id}
            type="button"
            onClick={() => onClickTask(w.id)}
            title={w.title}
            style={taskBtn(w.active, w.minimized)}
          >
            <img
              src="/mochi.png"
              alt=""
              style={{ width: 14, height: 14, objectFit: "contain", mixBlendMode: "screen", flexShrink: 0 }}
            />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {w.title}
            </span>
          </button>
        ))}
      </div>

      {/* System tray */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "linear-gradient(180deg,#1229a0,#1941a5)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 4,
        padding: "0 10px",
        height: 32,
        flexShrink: 0,
        position: "relative",
      }}>
        {walletAddress ? (
          <>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#0f0", boxShadow: "0 0 6px #0f0", flexShrink: 0 }} />
            <span
              style={{ color: "#fff", fontSize: 11, fontFamily: "monospace", cursor: "pointer", userSelect: "none" }}
              onClick={() => setShowDisconnect((s) => !s)}
              title="Click to disconnect"
            >
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </span>

            {showDisconnect && (
              <div style={{
                position: "absolute",
                bottom: 38, right: 0,
                background: "#c0c0c0",
                border: "2px solid",
                borderColor: "#fff #404040 #404040 #fff",
                boxShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                zIndex: 9999,
                minWidth: 160,
              }}>
                <div style={{ padding: "4px 8px", fontSize: 11, color: "#666", borderBottom: "1px solid #aaa" }}>
                  {walletAddress.slice(0, 12)}...{walletAddress.slice(-6)}
                </div>
                <button
                  type="button"
                  onClick={() => { onDisconnect(); setShowDisconnect(false); }}
                  style={{ width: "100%", padding: "6px 12px", background: "none", border: "none", cursor: "pointer", fontSize: 12, fontFamily: '"MS Sans Serif","Pixelify Sans",sans-serif', textAlign: "left", color: "#000" }}
                  onMouseEnter={(e) => { (e.target as HTMLElement).style.background = "#000080"; (e.target as HTMLElement).style.color = "#fff"; }}
                  onMouseLeave={(e) => { (e.target as HTMLElement).style.background = "none"; (e.target as HTMLElement).style.color = "#000"; }}
                >
                  Disconnect Wallet
                </button>
              </div>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={onConnect}
            disabled={connecting}
            style={{
              padding: "3px 12px",
              background: connecting ? "#aaa" : "#c0c0c0",
              border: "2px solid",
              borderColor: "#fff #404040 #404040 #fff",
              fontSize: 11,
              fontWeight: "bold",
              cursor: connecting ? "wait" : "pointer",
              fontFamily: '"MS Sans Serif","Pixelify Sans",sans-serif',
            }}
          >
            {connecting ? "Connecting..." : "Connect Wallet"}
          </button>
        )}

        <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.2)" }} />

        <div style={{ color: "#fff", fontSize: 12, fontFamily: "monospace", minWidth: 38, textAlign: "center" }}>
          {time}
        </div>
      </div>
    </div>
  );
}