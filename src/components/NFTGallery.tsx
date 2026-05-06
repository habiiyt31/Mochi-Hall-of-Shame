"use client";

import { useState, useEffect, useCallback } from "react";
import Win98Window from "./Win98Window";
import NFTCertificate from "./NFTCertificate";
import { getRarity, type Rarity } from "@/lib/rarity";
import type { NFTMetadata } from "@/types/contract";

interface Props {
  zIndex: number;
  onFocus: () => void;
  getNFT: (tokenId: bigint) => Promise<NFTMetadata>;
  getTotalNFTs: () => Promise<bigint>;
  walletAddress: string | null;
}

const RARITY_FILTERS: { label: string; value: Rarity | "all" | "mine" }[] = [
  { label: "All", value: "all" },
  { label: "Mine", value: "mine" },
  { label: "Mythic", value: "MYTHIC" },
  { label: "Legendary", value: "LEGENDARY" },
  { label: "Epic", value: "EPIC" },
  { label: "Rare", value: "RARE" },
  { label: "Uncommon", value: "UNCOMMON" },
  { label: "Common", value: "COMMON" },
  { label: "Based", value: "BASED" },
];

export default function NFTGallery({
  zIndex,
  onFocus,
  getNFT,
  getTotalNFTs,
  walletAddress,
}: Props) {
  const [nfts, setNfts] = useState<NFTMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<NFTMetadata | null>(null);
  const [filter, setFilter] = useState<Rarity | "all" | "mine">("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const total = await getTotalNFTs();
      const items: NFTMetadata[] = [];
      for (let i = 0n; i < total; i++) {
        try {
          const nft = await getNFT(i);
          items.push(nft);
        } catch { /* skip */ }
      }
      setNfts(items.reverse());
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [getNFT, getTotalNFTs]);

  useEffect(() => { load(); }, [load]);

  const filtered = nfts.filter((nft) => {
    if (filter === "all") return true;
    if (filter === "mine") {
      return walletAddress &&
        String(nft.owner).toLowerCase() === walletAddress.toLowerCase();
    }
    const rarity = getRarity(Number(nft.cringe_score), "");
    return rarity.rarity === filter;
  });

  const btn: React.CSSProperties = {
    padding: "3px 8px",
    background: "#c0c0c0",
    border: "2px solid",
    borderColor: "#fff #404040 #404040 #fff",
    fontFamily: "inherit",
    fontSize: 10,
    fontWeight: "bold",
    cursor: "pointer",
    whiteSpace: "nowrap",
  };

  const btnActive: React.CSSProperties = {
    ...btn,
    borderColor: "#404040 #fff #fff #404040",
    background: "#aaa",
  };

  return (
    <>
      <Win98Window
        title="NFT Gallery — Mochi's Certified L Collection"
        defaultPos={{ x: 540, y: 400 }}
        width={520}
        zIndex={zIndex}
        onFocus={onFocus}
      >
        {/* Filter tabs */}
        <div style={{
          display: "flex",
          gap: 4,
          flexWrap: "wrap",
          marginBottom: 10,
          alignItems: "center",
        }}>
          {RARITY_FILTERS.map((f) => {
            const count = f.value === "all"
              ? nfts.length
              : f.value === "mine"
              ? nfts.filter((n) => walletAddress && String(n.owner).toLowerCase() === walletAddress.toLowerCase()).length
              : nfts.filter((n) => getRarity(Number(n.cringe_score), "").rarity === f.value).length;

            if (count === 0 && f.value !== "all" && f.value !== "mine") return null;

            return (
              <button
                key={f.value}
                type="button"
                style={filter === f.value ? btnActive : btn}
                onClick={() => setFilter(f.value)}
              >
                {f.label} ({count})
              </button>
            );
          })}
          <div style={{ flex: 1 }} />
          <button
            type="button"
            style={btn}
            onClick={load}
          >
            {loading ? "..." : "Refresh"}
          </button>
        </div>

        {/* Grid */}
        <div style={{
          maxHeight: 360,
          overflowY: "auto",
          border: "2px solid",
          borderColor: "#404040 #fff #fff #404040",
          background: "#111",
          padding: 8,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: 8,
        }}>
          {loading && (
            <div style={{
              color: "#666",
              fontSize: 12,
              padding: 20,
              textAlign: "center",
              gridColumn: "1/-1",
            }}>
              Loading NFTs...
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div style={{
              color: "#666",
              fontSize: 12,
              padding: 20,
              textAlign: "center",
              gridColumn: "1/-1",
            }}>
              {filter === "mine"
                ? "You have no NFTs yet."
                : `No ${filter} NFTs found.`}
            </div>
          )}
          {filtered.map((nft, i) => (
            <NFTCard
              key={i}
              nft={nft}
              walletAddress={walletAddress}
              onClick={() => setSelected(nft)}
            />
          ))}
        </div>
      </Win98Window>

      {selected && (
        <NFTCertificate
          nft={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}

function NFTCard({
  nft,
  walletAddress,
  onClick,
}: {
  nft: NFTMetadata;
  walletAddress: string | null;
  onClick: () => void;
}) {
  const score = Number(nft.cringe_score);
  const tokenId = Number(nft.entry_id);
  const rarity = getRarity(score, "");
  const isOwn = walletAddress &&
    String(nft.owner).toLowerCase() === walletAddress.toLowerCase();
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: rarity.bg,
        border: `2px solid ${hovered ? rarity.color : "rgba(255,255,255,0.15)"}`,
        boxShadow: hovered ? rarity.glow : "none",
        padding: 10,
        cursor: "pointer",
        transition: "all 0.15s",
        transform: hovered ? "scale(1.03)" : "scale(1)",
        position: "relative",
      }}
    >
      {/* Mochi image top */}
      <div style={{ textAlign: "center", marginBottom: 6 }}>
        <div style={{
          width: 40,
          height: 40,
          margin: "0 auto",
          position: "relative",
          overflow: "hidden",
          borderRadius: "50%",
          background: "rgba(0,0,0,0.3)",
        }}>
          <img
            src="/mochi.png"
            alt="Mochi"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              mixBlendMode: "screen",
            }}
          />
        </div>
      </div>

      {/* YOU badge */}
      {isOwn && (
        <div style={{
          position: "absolute",
          top: 4,
          right: 4,
          fontSize: 8,
          color: "#0f0",
          fontWeight: "bold",
          background: "rgba(0,0,0,0.5)",
          padding: "1px 4px",
        }}>
          YOU
        </div>
      )}

      {/* Rarity */}
      <div style={{
        color: rarity.color,
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 7,
        marginBottom: 4,
        textShadow: `0 0 6px ${rarity.color}`,
        textAlign: "center",
      }}>
        {rarity.emoji} {rarity.label}
      </div>

      {/* Score */}
      <div style={{
        color: rarity.color,
        fontSize: 24,
        fontWeight: "bold",
        fontFamily: '"Press Start 2P", monospace',
        textAlign: "center",
        lineHeight: 1,
        marginBottom: 2,
      }}>
        {score}
      </div>
      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, textAlign: "center" }}>
        /100 cringe
      </div>

      {/* Score bar */}
      <div style={{ height: 3, background: "rgba(255,255,255,0.1)", marginTop: 6, marginBottom: 4 }}>
        <div style={{
          height: "100%",
          width: `${score}%`,
          background: rarity.color,
          boxShadow: `0 0 4px ${rarity.color}`,
        }} />
      </div>

      {/* Token ID */}
      <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, fontFamily: "monospace", textAlign: "center" }}>
        #{tokenId}
      </div>

      {hovered && (
        <div style={{
          color: "rgba(255,255,255,0.6)",
          fontSize: 9,
          marginTop: 4,
          textAlign: "center",
        }}>
          Click to view
        </div>
      )}
    </div>
  );
}