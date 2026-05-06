"use client";

import { useState, useEffect } from "react";
import Win98Window from "./Win98Window";
import type { NFTMetadata } from "@/types/contract";
import { getRarity } from "@/lib/rarity";
import { generateNFTImage, downloadNFTImage } from "@/lib/nftCanvas";

interface Props {
  nft: NFTMetadata;
  onClose: () => void;
}

export default function NFTCertificate({ nft, onClose }: Props) {
  const score = Number(nft.cringe_score);
  const tokenId = Number(nft.entry_id);
  const owner = String(nft.owner);
  const ownerShort = `${owner.slice(0, 8)}...${owner.slice(-6)}`;
  const rarity = getRarity(score, "");
  const [generating, setGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    let url: string;
    generateNFTImage(nft).then((blob) => {
      url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    });
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [nft]);

  async function handleShare() {
    setGenerating(true);
    try {
      const blob = await generateNFTImage(nft);
      const text = `Just got roasted on-chain by Mochi!\n\nCringe score: ${score}/100 ${rarity.emoji} ${rarity.label}\n\n"${String(nft.roast_text).slice(0, 100)}..."\n\nBuilt on @GenLayer #MochiHallOfShame #GenLayer`;
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
      const imgUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = imgUrl;
      a.download = `mochi-certified-l-${tokenId}.png`;
      a.click();
      URL.revokeObjectURL(imgUrl);
    } finally {
      setGenerating(false);
    }
  }

  async function handleDownload() {
    setGenerating(true);
    try { await downloadNFTImage(nft); }
    finally { setGenerating(false); }
  }

  const btn: React.CSSProperties = {
    padding: "5px 14px",
    background: "#c0c0c0",
    border: "2px solid",
    borderColor: "#fff #404040 #404040 #fff",
    fontFamily: "inherit",
    fontSize: 12,
    fontWeight: "bold",
    cursor: generating ? "wait" : "pointer",
    opacity: generating ? 0.7 : 1,
  };

  const btnPrimary: React.CSSProperties = {
    ...btn,
    background: "linear-gradient(180deg,#1084d0,#000080)",
    color: "#fff",
    borderColor: "#5cb0e8 #002060 #002060 #5cb0e8",
  };

  return (
    <Win98Window
      id="certificate"
      title={`${rarity.emoji} Mochi's Certified L — Token #${tokenId}`}
      defaultPos={{
        x: typeof window !== "undefined" ? Math.max(20, window.innerWidth / 2 - 280) : 100,
        y: 50,
      }}
      defaultSize={{ w: 560, h: 580 }}
      onClose={onClose}
      zIndex={9999}
    >
      <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 10 }}>

        {/* Rarity header */}
        <div style={{
          background: rarity.bg,
          border: `2px solid ${rarity.color}`,
          boxShadow: rarity.glow,
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexShrink: 0,
        }}>
          <img
            src="/mochi.png"
            alt="Mochi"
            style={{
              width: 52, height: 52,
              objectFit: "contain",
              mixBlendMode: "screen",
              filter: "drop-shadow(0 0 10px rgba(255,0,200,0.8))",
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{
              color: rarity.color,
              fontFamily: '"Press Start 2P", monospace',
              fontSize: 12,
              textShadow: `0 0 10px ${rarity.color}`,
              marginBottom: 4,
            }}>
              {rarity.emoji} {rarity.label}
            </div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 10 }}>
              {rarity.description}
            </div>
          </div>
          <div style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 20,
            color: rarity.color,
            textShadow: `0 0 16px ${rarity.color}`,
            flexShrink: 0,
          }}>
            {score}/100
          </div>
        </div>

        {/* Canvas preview */}
        <div style={{
          border: "2px solid",
          borderColor: "#404040 #fff #fff #404040",
          background: "#000",
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          minHeight: 200,
        }}>
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Mochi's Certified L"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : (
            <div style={{ color: "#666", fontSize: 12, textAlign: "center" }}>
              <img src="/mochi.png" alt="" style={{ width: 36, height: 36, objectFit: "contain", mixBlendMode: "screen", display: "block", margin: "0 auto 8px" }} />
              Generating certificate...
            </div>
          )}
        </div>

        {/* Details */}
        <div style={{
          background: "#fff",
          border: "2px solid",
          borderColor: "#404040 #fff #fff #404040",
          padding: 10,
          fontSize: 12,
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", gap: 16, marginBottom: 6 }}>
            <div><span style={{ color: "#666" }}>Owner: </span><span style={{ fontFamily: "monospace" }}>{ownerShort}</span></div>
            <div><span style={{ color: "#666" }}>Token: </span><strong>#{tokenId}</strong></div>
          </div>
          <div style={{
            borderLeft: `3px solid ${rarity.color}`,
            paddingLeft: 8,
            fontFamily: '"Comic Sans MS", cursive',
            fontStyle: "italic",
            color: "#333",
            lineHeight: 1.5,
          }}>
            &ldquo;{nft.roast_text}&rdquo;
            <div style={{ fontSize: 10, color: "#999", marginTop: 4, fontStyle: "normal" }}>
              — Mochi the Meme Lord
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flexShrink: 0 }}>
          <button type="button" onClick={handleShare} style={btnPrimary} disabled={generating}>
            {generating ? "Generating..." : "Share to X + Download PNG"}
          </button>
          <button type="button" onClick={handleDownload} style={btn} disabled={generating}>
            Download PNG
          </button>
          <button type="button" onClick={onClose} style={btn}>Close</button>
        </div>

        <div style={{ fontSize: 10, color: "#888", flexShrink: 0 }}>
          PNG downloads automatically. Attach it to your X post manually.
        </div>
      </div>
    </Win98Window>
  );
}