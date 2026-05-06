"use client";

export default function BackgroundVibe() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      {/* Sky gradient */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, #4a90d9 0%, #87ceeb 40%, #b8e4f7 60%, #c8eaf0 70%)",
      }} />

      {/* Pixel clouds */}
      <PixelCloud x={8} y={8} scale={1.4} />
      <PixelCloud x={35} y={5} scale={1} />
      <PixelCloud x={60} y={10} scale={1.2} />
      <PixelCloud x={78} y={6} scale={0.9} />

      {/* Pixel sun */}
      <div style={{
        position: "absolute", top: "6%", right: "12%",
        width: 48, height: 48,
        background: "#ffe566",
        boxShadow: "0 0 0 8px rgba(255,229,102,0.3)",
        imageRendering: "pixelated",
        clipPath: `polygon(
          35% 0%, 65% 0%,
          65% 35%, 100% 35%, 100% 65%,
          65% 65%, 65% 100%, 35% 100%,
          35% 65%, 0% 65%, 0% 35%,
          35% 35%
        )`,
      }} />

      {/* Hills - back layer */}
      <svg
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          bottom: "28%",
          left: 0, right: 0,
          width: "100%",
          height: "35%",
          shapeRendering: "crispEdges",
        }}
      >
        <path
          d="M0 40 L0 22 Q8 8 16 18 Q24 26 32 14 Q40 4 48 16 Q56 26 64 12 Q72 2 80 15 Q88 26 96 18 L100 22 L100 40 Z"
          fill="#5a9e3a"
        />
        <path
          d="M0 40 L0 24 Q5 16 10 20 Q15 24 20 18 Q25 12 30 20 Q35 26 40 18 Q45 10 50 18 Q55 26 60 16 Q65 8 70 18 Q75 26 80 20 Q85 14 90 20 Q95 26 100 22 L100 40 Z"
          fill="#4a8a2a"
        />
      </svg>

      {/* Main hill - the iconic Bliss hill */}
      <svg
        viewBox="0 0 100 30"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          bottom: "14%",
          left: 0, right: 0,
          width: "100%",
          height: "30%",
          shapeRendering: "crispEdges",
        }}
      >
        <path
          d="M0 30 L0 20 Q10 2 20 14 Q28 22 36 10 Q44 0 52 10 Q60 20 68 8 Q76 -2 84 10 Q92 20 100 16 L100 30 Z"
          fill="#6ab840"
        />
        {/* Pixel grass texture dots */}
        {/* Pixel grass texture dots - static values to avoid hydration mismatch */}
        {[
          [0,18],[2.5,22],[5,23],[7.5,21],[10,18],[12.5,16],[15,17],[17.5,20],
          [20,23],[22.5,24],[25,22],[27.5,19],[30,17],[32.5,16],[35,18],[37.5,21],
          [40,23],[42.5,22],[45,20],[47.5,18],[50,17],[52.5,18],[55,20],[57.5,23],
          [60,24],[62.5,22],[65,19],[67.5,17],[70,16],[72.5,18],[75,21],[77.5,23],
          [80,22],[82.5,20],[85,18],[87.5,17],[90,18],[92.5,21],[95,23],[97.5,22],
        ].map(([x, y], i) => (
          <rect key={i} x={x} y={y} width={1} height={1} fill="#5aaa30" opacity={0.6} />
        ))}
      </svg>

      {/* Ground */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        height: "16%",
        background: "linear-gradient(180deg, #6ab840 0%, #5a9e30 40%, #4a8820 100%)",
      }} />

      {/* Pixel grass blades on ground */}
      <div style={{
        position: "absolute",
        bottom: "14%",
        left: 0, right: 0,
        height: 12,
        backgroundImage: `repeating-linear-gradient(
          90deg,
          #5aaa30 0px, #5aaa30 2px,
          transparent 2px, transparent 6px,
          #4a9a20 6px, #4a9a20 8px,
          transparent 8px, transparent 14px
        )`,
        imageRendering: "pixelated",
      }} />

      {/* Pixel trees */}
      <PixelTree x={5} />
      <PixelTree x={88} />
      <PixelTree x={15} small />
      <PixelTree x={78} small />

      {/* Pixel birds */}
      <PixelBird x={20} y={15} />
      <PixelBird x={45} y={10} />
      <PixelBird x={70} y={18} />

      {/* Scanline overlay subtle */}
      <div style={{
        position: "absolute", inset: 0,
        background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 4px)",
        pointerEvents: "none",
      }} />
    </div>
  );
}

function PixelCloud({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  const size = Math.round(8 * scale);
  return (
    <div style={{
      position: "absolute",
      left: `${x}%`,
      top: `${y}%`,
      imageRendering: "pixelated",
    }}>
      <svg
        width={size * 8}
        height={size * 4}
        viewBox="0 0 40 20"
        shapeRendering="crispEdges"
      >
        {/* Cloud pixel blocks */}
        <rect x="8" y="12" width="24" height="8" fill="white" opacity="0.95" />
        <rect x="4" y="14" width="32" height="6" fill="white" opacity="0.95" />
        <rect x="12" y="8" width="16" height="8" fill="white" opacity="0.95" />
        <rect x="16" y="4" width="10" height="6" fill="white" opacity="0.9" />
        {/* Shadow */}
        <rect x="8" y="18" width="24" height="2" fill="#d0e8f0" opacity="0.6" />
      </svg>
    </div>
  );
}

function PixelTree({ x, small = false }: { x: number; small?: boolean }) {
  const h = small ? 40 : 60;
  const w = small ? 28 : 40;
  return (
    <div style={{
      position: "absolute",
      left: `${x}%`,
      bottom: "14%",
      imageRendering: "pixelated",
      width: w,
      height: h,
    }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} shapeRendering="crispEdges">
        {/* Trunk */}
        <rect x={w/2 - 3} y={h - 16} width={6} height={16} fill="#6b3d1e" />
        {/* Canopy layers */}
        <rect x={w/2 - 12} y={h - 28} width={24} height={16} fill="#2d7a1e" />
        <rect x={w/2 - 10} y={h - 38} width={20} height={14} fill="#3a8f28" />
        <rect x={w/2 - 8} y={h - 46} width={16} height={12} fill="#4aa030" />
        {/* Highlights */}
        <rect x={w/2 - 6} y={h - 44} width={4} height={4} fill="#5ab838" opacity="0.7" />
      </svg>
    </div>
  );
}

function PixelBird({ x, y }: { x: number; y: number }) {
  return (
    <div style={{
      position: "absolute",
      left: `${x}%`,
      top: `${y}%`,
      imageRendering: "pixelated",
      animation: "float 4s ease-in-out infinite",
      animationDelay: `${x * 0.1}s`,
    }}>
      <svg width={16} height={8} viewBox="0 0 16 8" shapeRendering="crispEdges">
        <rect x="0" y="4" width="4" height="2" fill="#333" />
        <rect x="4" y="2" width="2" height="2" fill="#333" />
        <rect x="6" y="0" width="4" height="2" fill="#333" />
        <rect x="10" y="2" width="2" height="2" fill="#333" />
        <rect x="12" y="4" width="4" height="2" fill="#333" />
      </svg>
    </div>
  );
}