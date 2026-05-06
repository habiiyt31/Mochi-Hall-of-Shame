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
  id: string;
  title: string;
  children: ReactNode;
  defaultPos?: { x: number; y: number };
  defaultSize?: { w: number; h: number };
  onClose?: () => void;
  zIndex?: number;
  onFocus?: () => void;
  isMinimized?: boolean;
}

type ResizeDir = "n"|"s"|"e"|"w"|"ne"|"nw"|"se"|"sw"|null;

export default function Win98Window({
  title,
  children,
  defaultPos = { x: 80, y: 80 },
  defaultSize = { w: 480, h: 400 },
  onClose,
  zIndex = 10,
  onFocus,
  isMinimized = false,
}: Props) {
  const [pos, setPos] = useState(defaultPos);
  const [size, setSize] = useState(defaultSize);
  const [maximized, setMaximized] = useState(false);
  const [preMax, setPreMax] = useState({ pos: defaultPos, size: defaultSize });
  const [dragging, setDragging] = useState(false);
  const [resizeDir, setResizeDir] = useState<ResizeDir>(null);
  const [vp, setVp] = useState({ w: 1200, h: 800 });

  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef<number | null>(null);
  const dragOff = useRef({ x: 0, y: 0 });
  const resStart = useRef({ mx: 0, my: 0, px: 0, py: 0, pw: 0, ph: 0 });

  const TASKBAR = 40;
  const TOPBAR = 0;
  const MIN_W = 260;
  const MIN_H = 180;
  const EDGE = 6;

  useEffect(() => {
    const update = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  function toggleMax() {
    if (maximized) {
      setPos(preMax.pos);
      setSize(preMax.size);
      setMaximized(false);
    } else {
      setPreMax({ pos, size });
      setPos({ x: 0, y: TOPBAR });
      setSize({ w: vp.w, h: vp.h - TOPBAR - TASKBAR });
      setMaximized(true);
    }
  }

  // ── Drag ──────────────────────────────────────────────
  function onTitleDown(e: RPointerEvent<HTMLDivElement>) {
    if (maximized) return;
    onFocus?.();
    const t = e.target as HTMLElement;
    if (t.closest("[data-btn]")) return;
    setDragging(true);
    document.body.classList.add("dragging");
    const rect = ref.current!.getBoundingClientRect();
    dragOff.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  const onTitleMove = useCallback((e: RPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    if (raf.current) cancelAnimationFrame(raf.current);
    const nx = e.clientX - dragOff.current.x;
    const ny = e.clientY - dragOff.current.y;
    raf.current = requestAnimationFrame(() => {
      setPos({
        x: Math.max(0, Math.min(nx, vp.w - 100)),
        y: Math.max(0, Math.min(ny, vp.h - TASKBAR - 30)),
      });
    });
  }, [dragging, vp]);

  function onTitleUp(e: RPointerEvent<HTMLDivElement>) {
    setDragging(false);
    document.body.classList.remove("dragging");
    if (raf.current) { cancelAnimationFrame(raf.current); raf.current = null; }
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
  }

  // ── Resize ────────────────────────────────────────────
  function startResize(e: React.PointerEvent, dir: ResizeDir) {
    e.stopPropagation();
    onFocus?.();
    setResizeDir(dir);
    document.body.classList.add("dragging");
    resStart.current = {
      mx: e.clientX, my: e.clientY,
      px: pos.x, py: pos.y,
      pw: size.w, ph: size.h,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onResizeMove(e: React.PointerEvent) {
    if (!resizeDir) return;
    if (raf.current) cancelAnimationFrame(raf.current);
    const dx = e.clientX - resStart.current.mx;
    const dy = e.clientY - resStart.current.my;
    const { px, py, pw, ph } = resStart.current;
    raf.current = requestAnimationFrame(() => {
      let nx = px, ny = py, nw = pw, nh = ph;
      if (resizeDir.includes("e")) nw = Math.max(MIN_W, pw + dx);
      if (resizeDir.includes("s")) nh = Math.max(MIN_H, ph + dy);
      if (resizeDir.includes("w")) { nw = Math.max(MIN_W, pw - dx); nx = px + (pw - nw); }
      if (resizeDir.includes("n")) { nh = Math.max(MIN_H, ph - dy); ny = py + (ph - nh); }
      setSize({ w: nw, h: nh });
      setPos({ x: nx, y: ny });
    });
  }

  function onResizeUp(e: React.PointerEvent) {
    setResizeDir(null);
    document.body.classList.remove("dragging");
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
  }

  useEffect(() => () => {
    if (raf.current) cancelAnimationFrame(raf.current);
    document.body.classList.remove("dragging");
  }, []);

  if (isMinimized) return null;

  const cp = maximized ? { x: 0, y: TOPBAR } : pos;
  const cs = maximized ? { w: vp.w, h: vp.h - TOPBAR - TASKBAR } : size;

  const btn: React.CSSProperties = {
    width: 18, height: 16,
    border: "1px solid",
    borderColor: "#fff #404040 #404040 #fff",
    background: "#c0c0c0",
    color: "#000", fontWeight: "bold",
    fontSize: 11, cursor: "pointer",
    padding: 0, lineHeight: "14px",
    flexShrink: 0, display: "flex",
    alignItems: "center", justifyContent: "center",
  };

  const eStyle = (cursor: string, style: React.CSSProperties): React.CSSProperties => ({
    position: "absolute", cursor, zIndex: 10,
    userSelect: "none", ...style,
  });

  return (
    <div
      ref={ref}
      onPointerMove={resizeDir ? onResizeMove : undefined}
      onPointerUp={resizeDir ? onResizeUp : undefined}
      onPointerDown={() => onFocus?.()}
      style={{
        position: "fixed",
        left: cp.x, top: cp.y,
        width: cs.w, height: cs.h,
        zIndex,
        background: "#c0c0c0",
        borderWidth: maximized ? 0 : 2,
        borderStyle: "solid",
        borderColor: "#fff #404040 #404040 #fff", 
        boxShadow: "2px 2px 4px rgba(0,0,0,0.3)",
        fontFamily: '"MS Sans Serif","Pixelify Sans",sans-serif',
        display: "flex", flexDirection: "column",
        willChange: (dragging || !!resizeDir) ? "left,top,width,height" : "auto",
      }}
    >
      {/* Resize handles */}
      {!maximized && (<>
        <div style={eStyle("n-resize", { top:0, left:EDGE, right:EDGE, height:EDGE })} onPointerDown={(e) => startResize(e,"n")} />
        <div style={eStyle("s-resize", { bottom:0, left:EDGE, right:EDGE, height:EDGE })} onPointerDown={(e) => startResize(e,"s")} />
        <div style={eStyle("e-resize", { right:0, top:EDGE, bottom:EDGE, width:EDGE })} onPointerDown={(e) => startResize(e,"e")} />
        <div style={eStyle("w-resize", { left:0, top:EDGE, bottom:EDGE, width:EDGE })} onPointerDown={(e) => startResize(e,"w")} />
        <div style={eStyle("nw-resize", { top:0, left:0, width:EDGE*2, height:EDGE*2 })} onPointerDown={(e) => startResize(e,"nw")} />
        <div style={eStyle("ne-resize", { top:0, right:0, width:EDGE*2, height:EDGE*2 })} onPointerDown={(e) => startResize(e,"ne")} />
        <div style={eStyle("sw-resize", { bottom:0, left:0, width:EDGE*2, height:EDGE*2 })} onPointerDown={(e) => startResize(e,"sw")} />
        <div style={eStyle("se-resize", { bottom:0, right:0, width:EDGE*2, height:EDGE*2 })} onPointerDown={(e) => startResize(e,"se")} />
      </>)}

      {/* Title bar */}
      <div
        onPointerDown={onTitleDown}
        onPointerMove={onTitleMove}
        onPointerUp={onTitleUp}
        onPointerCancel={onTitleUp}
        onDoubleClick={toggleMax}
        style={{
          background: "linear-gradient(90deg,#000080,#1084d0)",
          color: "#fff",
          padding: "3px 4px 3px 6px",
          display: "flex", alignItems: "center", gap: 4,
          cursor: maximized ? "default" : (dragging ? "grabbing" : "grab"),
          fontWeight: "bold", fontSize: 12,
          flexShrink: 0, touchAction: "none",
          userSelect: "none", minHeight: 26,
        }}
      >
        <img
          src="/mochi.png"
          alt=""
          style={{ width: 14, height: 14, objectFit: "contain", mixBlendMode: "screen", flexShrink: 0 }}
        />
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12 }}>
          {title}
        </span>
        <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
          <button data-btn type="button" style={btn} title="Minimize">_</button>
          <button data-btn type="button" style={btn} onClick={(e) => { e.stopPropagation(); toggleMax(); }} title={maximized ? "Restore" : "Maximize"}>
            {maximized ? "❐" : "□"}
          </button>
          {onClose && (
            <button
              data-btn type="button"
              style={{ ...btn, background: "#cc0000", color: "#fff", borderColor: "#ff6666 #660000 #660000 #ff6666", width: 20 }}
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              title="Close"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Content area */}
      <div style={{ flex: 1, overflow: "auto", padding: 12, color: "#000", minHeight: 0 }}>
        {children}
      </div>
    </div>
  );
}