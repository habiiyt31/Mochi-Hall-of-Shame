"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
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
  const [viewport, setViewport] = useState({ w: 0, h: 0 });

  const offset = useRef({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);

  // ✅ Handle viewport safely (SSR-safe)
  useEffect(() => {
    const update = () => {
      setViewport({
        w: window.innerWidth,
        h: window.innerHeight,
      });
    };

    update(); // initial
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // ✅ Clamp helper biar window nggak keluar layar
  const clamp = useCallback(
    (x: number, y: number) => {
      const maxX = viewport.w ? viewport.w - 100 : x;
      const maxY = viewport.h ? viewport.h - 50 : y;

      return {
        x: Math.max(0, Math.min(x, maxX)),
        y: Math.max(0, Math.min(y, maxY)),
      };
    },
    [viewport]
  );

  // ✅ Smooth drag pakai RAF
  const onMove = useCallback(
    (e: RPointerEvent<HTMLDivElement>) => {
      if (!dragging) return;

      const nextX = e.clientX - offset.current.x;
      const nextY = e.clientY - offset.current.y;

      if (rafId.current) cancelAnimationFrame(rafId.current);

      rafId.current = requestAnimationFrame(() => {
        setPos(clamp(nextX, nextY));
      });
    },
    [dragging, clamp]
  );

  function onDown(e: RPointerEvent<HTMLDivElement>) {
    onFocus?.();

    const t = e.target as HTMLElement;
    if (!t.closest("[data-titlebar]") || t.closest("[data-btn]")) return;

    setDragging(true);
    document.body.classList.add("dragging");

    const rect = ref.current!.getBoundingClientRect();
    offset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onUp(e: RPointerEvent<HTMLDivElement>) {
    setDragging(false);
    document.body.classList.remove("dragging");

    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  }

  // cleanup
  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      document.body.classList.remove("dragging");
    };
  }, []);

  // ✅ Width aman (no window access langsung)
  const computedWidth =
    viewport.w > 0 ? Math.min(width, viewport.w - 20) : width;

  const btn: React.CSSProperties = {
    width: 18,
    height: 16,
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
        width: computedWidth,
        maxWidth: "calc(100vw - 20px)", // fallback CSS
        zIndex,
        background: "#c0c0c0",
        border: "2px solid",
        borderColor: "#fff #404040 #404040 #fff",
        boxShadow: dragging
          ? "4px 4px 0 rgba(0,0,0,0.3)"
          : "2px 2px 0 rgba(0,0,0,0.2)",
        fontFamily: '"MS Sans Serif", "Pixelify Sans", sans-serif',
        animation: "slideUp 0.3s ease-out",
        willChange: dragging ? "left, top" : "auto",
      }}
    >
      {/* Title Bar */}
      <div
        data-titlebar
        style={{
          background: "linear-gradient(90deg,#000080,#1084d0)",
          color: "#fff",
          padding: "4px 6px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: dragging ? "grabbing" : "grab",
          fontWeight: "bold",
          fontSize: 12,
          touchAction: "none",
        }}
      >
        <span style={{ paddingLeft: 4, userSelect: "none" }}>
          {title}
        </span>

        <div style={{ display: "flex", gap: 2 }}>
          <button
            data-btn
            style={btn}
            onClick={() => setMinimized((m) => !m)}
          >
            {minimized ? "□" : "_"}
          </button>

          {onClose && (
            <button data-btn style={btn} onClick={onClose}>
              x
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {!minimized && (
        <div
          style={{
            padding: 12,
            maxHeight: "calc(100vh - 100px)",
            overflowY: "auto",
            color: "#000",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}