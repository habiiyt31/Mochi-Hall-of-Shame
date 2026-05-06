"use client";

import {
  useState,
  useRef,
  useEffect,
  type ReactNode,
  type PointerEvent as RPointerEvent,
} from "react";

interface Props {
  title: string;
  children: ReactNode;
  defaultPos?: { x: number; y: number };
  width?: number;
  onClose?: () => void;
  zIndex?: number;
  onFocus?: () => void;
}

export default function Win98Window({
  title,
  children,
  defaultPos = { x: 80, y: 80 },
  width = 480,
  onClose,
  zIndex = 10,
  onFocus,
}: Props) {
  const [pos, setPos] = useState(defaultPos);
  const [dragging, setDragging] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const offset = useRef({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clamp = () =>
      setPos((p) => ({
        x: Math.min(p.x, window.innerWidth - 100),
        y: Math.min(p.y, window.innerHeight - 50),
      }));
    window.addEventListener("resize", clamp);
    return () => window.removeEventListener("resize", clamp);
  }, []);

  function onDown(e: RPointerEvent<HTMLDivElement>) {
    onFocus?.();
    const t = e.target as HTMLElement;
    if (!t.closest("[data-titlebar]") || t.closest("[data-btn]")) return;
    setDragging(true);
    const rect = ref.current!.getBoundingClientRect();
    offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onMove(e: RPointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    setPos({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y });
  }

  function onUp(e: RPointerEvent<HTMLDivElement>) {
    setDragging(false);
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* noop */ }
  }

  const btn: React.CSSProperties = {
    width: 18, height: 16,
    background: "#c0c0c0",
    border: "1px solid",
    borderColor: "#fff #404040 #404040 #fff",
    color: "#000",
    fontWeight: "bold",
    fontSize: 12,
    cursor: "pointer",
    padding: 0,
    lineHeight: "14px",
  };

  return (
    <div
      ref={ref}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        width,
        zIndex,
        userSelect: dragging ? "none" : "auto",
        background: "#c0c0c0",
        border: "2px solid",
        borderColor: "#fff #404040 #404040 #fff",
        boxShadow: "1px 1px 0 #000",
        fontFamily: '"MS Sans Serif", "Pixelify Sans", sans-serif',
      }}
    >
      {/* Title bar */}
      <div
        data-titlebar
        style={{
          background: "linear-gradient(90deg,#000080,#1084d0)",
          color: "#fff",
          padding: "3px 4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: dragging ? "grabbing" : "grab",
          fontWeight: "bold",
          fontSize: 12,
        }}
      >
        <span style={{ paddingLeft: 4 }}>{title}</span>
        <div style={{ display: "flex", gap: 2 }}>
          <button data-btn type="button" style={btn} onClick={() => setMinimized((m) => !m)}>_</button>
          {onClose && <button data-btn type="button" style={btn} onClick={onClose}>x</button>}
        </div>
      </div>

      {!minimized && (
        <div style={{ padding: 12, color: "#000" }}>{children}</div>
      )}
    </div>
  );
}
