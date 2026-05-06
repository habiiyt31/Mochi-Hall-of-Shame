"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type CSSProperties,
} from "react";
import Win98Window from "@/components/Win98Window";
import MochiAssistant from "@/components/MochiAssistant";
import WalletConnect from "@/components/WalletConnect";
import BackgroundVibe from "@/components/BackgroundVibe";
import NFTCertificate from "@/components/NFTCertificate";
import NFTGallery from "@/components/NFTGallery";
import LoadingDots from "@/components/LoadingDots";
import Toast, { type ToastItem, type ToastType } from "@/components/Toast";
import { useWallet } from "@/hooks/useWallet";
import { useMochiContract } from "@/hooks/useMochiContract";
import type { RoastEntry, NFTMetadata, MochiMood, Verdict } from "@/types/contract";

const VERDICT_COLOR: Record<Verdict, string> = {
  NOOB: "#888",
  MID: "#cc9900",
  CRINGE: "#ff3366",
  LEGENDARY_L: "#cc00ff",
  BASED: "#00ccaa",
};

const TIPS = [
  "Skill issue. Just kidding... unless?",
  "Touch grass occasionally, ngmi otherwise",
  "Mid take. Try harder next time bro",
  "Based. But also still cringe somehow.",
  "wkwk anjir parah lo bro",
  "Bro really thought... no thoughts.",
  "Tab hoarding is a cry for help.",
];

const EXAMPLES = [
  "I have 847 browser tabs open and my laptop sounds like a jet engine",
  "I push directly to main and never write tests because I trust the vibes",
  "I name all variables a, b, c, d and call it clean code",
  "I use Comic Sans for all work presentations unironically",
  "I reply-all to every company email to show engagement",
  "I have 3 monitors but still alt-tab constantly",
  "I write TODO comments and never come back to them",
];

function verdictFromScore(score: number): Verdict {
  if (score >= 80) return "LEGENDARY_L";
  if (score >= 60) return "CRINGE";
  if (score >= 40) return "MID";
  if (score >= 20) return "NOOB";
  return "BASED";
}

const BTN: CSSProperties = {
  padding: "5px 14px",
  background: "#c0c0c0",
  border: "2px solid",
  borderColor: "#fff #404040 #404040 #fff",
  fontFamily: "inherit",
  fontSize: 12,
  fontWeight: "bold",
  cursor: "pointer",
};

const BTN_PRIMARY: CSSProperties = {
  ...BTN,
  background: "linear-gradient(180deg,#1084d0,#000080)",
  color: "#fff",
  borderColor: "#5cb0e8 #002060 #002060 #5cb0e8",
  padding: "6px 18px",
};

const MOCHI_ICON: CSSProperties = {
  width: 18,
  height: 18,
  objectFit: "contain",
  mixBlendMode: "screen",
  verticalAlign: "middle",
  marginRight: 4,
};

export default function HomePage() {
  const wallet = useWallet();
  const {
    loading,
    submitForRoast,
    mintCertificate,
    getRecentEntries,
    getTotalNFTs,
    getNFT,
  } = useMochiContract(wallet.genClient);

  const [text, setText] = useState("");
  const [entries, setEntries] = useState<RoastEntry[]>([]);
  const [topZ, setTopZ] = useState(20);
  const [wZ, setWZ] = useState({ submit: 13, hall: 12, gallery: 11, about: 10 });
  const [msg, setMsg] = useState<string | null>(
    "Yo! Connect your wallet and confess your most cringe digital habit."
  );
  const [mood, setMood] = useState<MochiMood>("smug");
  const [mintedNFT, setMintedNFT] = useState<NFTMetadata | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastIdRef = useRef(0);

  const pushToast = useCallback(
    (type: ToastType, message: string, duration?: number) => {
      const id = ++toastIdRef.current;
      setToasts((t) => [...t, { id, type, message, duration }]);
      return id;
    },
    []
  );

  const dismissToast = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const focusWin = useCallback(
    (k: keyof typeof wZ) => {
      setTopZ((z) => z + 1);
      setWZ((s) => ({ ...s, [k]: topZ + 1 }));
    },
    [topZ]
  );

  const refresh = useCallback(async () => {
    try {
      const r = await getRecentEntries(20);
      setEntries(r.slice().reverse());
    } catch { /* silent */ }
  }, [getRecentEntries]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 15000);
    return () => clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    if (wallet.connected && wallet.address) {
      setMsg("Wallet connected! Now drop your most cringe confession.");
      setMood("happy");
    }
  }, [wallet.connected, wallet.address]);

  async function handleSubmit() {
    if (!wallet.connected) {
      pushToast("error", "Connect your wallet first!");
      setMood("angry");
      return;
    }
    if (text.trim().length < 3) {
      pushToast("error", "Too short — give Mochi something to work with");
      return;
    }

    const loadingId = pushToast("loading", "Submitting to blockchain... validators are judging you");
    setMood("smug");
    setMsg("Hold up, validators are vibing on your L...");
    const submittedText = text;
    setText("");

    try {
      await submitForRoast(submittedText);
      dismissToast(loadingId);
      pushToast("success", "Roasted! Your shame is now permanent on-chain.", 5000);
      setMood("happy");
      setMsg("Done. Refresh in a moment to see your roast.");
      for (let i = 0; i < 8; i++) {
        await new Promise((r) => setTimeout(r, 3000));
        await refresh();
      }
    } catch (e) {
      dismissToast(loadingId);
      const errMsg = e instanceof Error ? e.message : String(e);
      const isTimeout =
        errMsg.toLowerCase().includes("timed out") ||
        errMsg.toLowerCase().includes("timeout");
      if (isTimeout) {
        pushToast("info", "Transaction submitted! Auto-refreshing...", 6000);
        setMood("smug");
        setMsg("Tx submitted! Auto-refreshing...");
        for (let i = 0; i < 6; i++) {
          await new Promise((r) => setTimeout(r, 4000));
          await refresh();
        }
      } else {
        pushToast("error", errMsg.slice(0, 100));
        setMood("angry");
        setMsg("Error: " + errMsg.slice(0, 80));
      }
    }
  }

  async function handleMint(entryId: bigint) {
    if (!wallet.connected) {
      pushToast("error", "Connect wallet to mint");
      return;
    }
    const loadingId = pushToast("loading", "Minting your Mochi's Certified L...");
    setMsg("Minting your certificate of shame...");
    try {
      await mintCertificate(entryId);
      dismissToast(loadingId);
      pushToast("success", "NFT minted! Welcome to the Hall of Legends.", 5000);
      setMood("happy");
      setMsg("Certified L. Blockchain remembers forever.");
      await new Promise((r) => setTimeout(r, 2000));
      try {
        const total = await getTotalNFTs();
        if (total > 0n) {
          const nft = await getNFT(total - 1n);
          setMintedNFT(nft);
        }
      } catch { /* silent */ }
      await refresh();
    } catch (e) {
      dismissToast(loadingId);
      const errMsg = e instanceof Error ? e.message : String(e);
      const isTimeout =
        errMsg.toLowerCase().includes("timed out") ||
        errMsg.toLowerCase().includes("timeout");
      if (isTimeout) {
        pushToast("info", "Mint submitted! Checking in a moment...", 5000);
        setTimeout(async () => {
          try {
            const total = await getTotalNFTs();
            if (total > 0n) {
              const nft = await getNFT(total - 1n);
              setMintedNFT(nft);
            }
            await refresh();
          } catch { /* silent */ }
        }, 8000);
      } else {
        pushToast("error", "Mint failed: " + errMsg.slice(0, 80));
        setMood("angry");
      }
    }
  }

  function fillExample() {
    setText(EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)]);
  }

  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden", paddingTop: 36 }}>
      <BackgroundVibe />
      <WalletConnect wallet={wallet} />

      {/* ── Submit Window ── */}
      <Win98Window
        title="Submit Your L — Mochi Hall of Shame"
        defaultPos={{ x: 30, y: 50 }}
        width={440}
        zIndex={wZ.submit}
        onFocus={() => focusWin("submit")}
      >
        {!wallet.connected ? (
          <div style={{ textAlign: "center", padding: "24px 8px" }}>
            <img
              src="/mochi.png"
              alt="Mochi"
              style={{
                width: 80,
                height: 80,
                objectFit: "contain",
                filter: "drop-shadow(0 0 12px rgba(255,0,200,0.7))",
                display: "block",
                margin: "0 auto 12px",
              }}
            />
            <p style={{ fontSize: 13, marginBottom: 6, fontWeight: "bold" }}>
              Welcome to Mochi Hall of Shame
            </p>
            <p style={{ fontSize: 12, color: "#444", marginBottom: 16, lineHeight: 1.5 }}>
              Connect your wallet to get roasted by an AI cyber-cat on GenLayer blockchain.
            </p>
            <button type="button" onClick={wallet.connect} style={BTN_PRIMARY}>
              {wallet.connecting ? <LoadingDots text="Connecting" /> : "Connect Wallet"}
            </button>
            {wallet.error && (
              <p style={{ fontSize: 11, color: "#c00", marginTop: 8 }}>{wallet.error}</p>
            )}
          </div>
        ) : (
          <>
            <p style={{ marginTop: 0, fontSize: 12, color: "#444", lineHeight: 1.5, marginBottom: 10 }}>
              Confess a weird digital habit or cringe tech opinion.
              Mochi will roast you on-chain via GenLayer AI validators.
            </p>
            <div style={{
              background: "#fff",
              border: "2px solid",
              borderColor: "#404040 #fff #fff #404040",
              padding: "6px 10px",
              marginBottom: 10,
              fontSize: 11,
              color: "#444",
            }}>
              Score 75+ = Mint NFT &nbsp;|&nbsp; Score 95+ = LEGENDARY
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              <button
                type="button"
                onClick={fillExample}
                style={{ ...BTN, fontSize: 11, padding: "3px 10px" }}
              >
                Random example
              </button>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. I have 847 browser tabs open and refuse to close them"
              rows={5}
              maxLength={400}
              disabled={loading}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: 8,
                border: "2px solid",
                borderColor: "#404040 #fff #fff #404040",
                background: loading ? "#eee" : "#fff",
                fontFamily: "inherit",
                fontSize: 13,
                resize: "vertical",
                minHeight: 90,
              }}
            />
            <div style={{
              marginTop: 10,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <span style={{ fontSize: 11, color: "#666" }}>{text.length} / 400</span>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  ...BTN_PRIMARY,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "wait" : "pointer",
                }}
              >
                {loading ? <LoadingDots text="Roasting" /> : "Get Roasted →"}
              </button>
            </div>
          </>
        )}
      </Win98Window>

      {/* ── Hall of Shame ── */}
      <Win98Window
        title="Hall of Shame — Permanent Record"
        defaultPos={{ x: 500, y: 50 }}
        width={500}
        zIndex={wZ.hall}
        onFocus={() => focusWin("hall")}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 12 }}>
            <strong>{entries.length}</strong> entries — auto refresh 15s
          </span>
          <button type="button" onClick={refresh} style={BTN}>Refresh</button>
        </div>
        <div style={{
          maxHeight: 400,
          overflowY: "auto",
          border: "2px solid",
          borderColor: "#404040 #fff #fff #404040",
          background: "#fff",
        }}>
          {entries.length === 0 && (
            <div style={{ padding: 28, textAlign: "center", color: "#666", fontSize: 13 }}>
              <div style={{ marginBottom: 8, opacity: 0.5 }}>
                <img
                  src="/mochi.png"
                  alt=""
                  style={{ width: 40, height: 40, objectFit: "contain", mixBlendMode: "screen" }}
                />
              </div>
              No entries yet. Be the first to get roasted.
            </div>
          )}
          {entries.map((entry, i) => {
            const score = Number(entry.cringe_score);
            const verdict = verdictFromScore(score);
            const entryId = BigInt(entries.length - 1 - i);
            const isOwn =
              wallet.address &&
              entry.player.toLowerCase() === wallet.address.toLowerCase();
            return (
              <div
                key={i}
                style={{
                  padding: 12,
                  borderBottom: "1px solid #ddd",
                  fontSize: 12,
                  background: isOwn ? "#f0f8ff" : "transparent",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ fontStyle: "italic", color: "#555", flex: 1 }}>
                    &ldquo;{entry.submission}&rdquo;
                  </div>
                  {isOwn && (
                    <span style={{ fontSize: 9, color: "#0a0", fontWeight: "bold", flexShrink: 0 }}>
                      YOU
                    </span>
                  )}
                </div>
                <div style={{
                  marginTop: 8,
                  padding: 10,
                  background: "#fffbe0",
                  borderLeft: "4px solid #cc00ff",
                  fontFamily: '"Comic Sans MS", cursive',
                  fontSize: 12,
                  lineHeight: 1.5,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 6,
                }}>
                  <img src="/mochi.png" alt="" style={MOCHI_ICON} />
                  <span>{entry.roast}</span>
                </div>
                <div style={{
                  marginTop: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 6,
                }}>
                  <div>
                    <span style={{
                      padding: "2px 8px",
                      background: VERDICT_COLOR[verdict],
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: "bold",
                    }}>
                      {verdict}
                    </span>
                    <span style={{ marginLeft: 8, fontSize: 11 }}>
                      Cringe: <strong>{score}/100</strong>
                    </span>
                  </div>
                  {isOwn && !entry.minted && score >= 75 && (
                    <button
                      type="button"
                      onClick={() => handleMint(entryId)}
                      style={BTN_PRIMARY}
                    >
                      Mint Certified L
                    </button>
                  )}
                  {entry.minted && (
                    <span style={{ fontSize: 11, color: "#0a0", fontWeight: "bold" }}>
                      ✓ Certified L
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Win98Window>

      {/* ── NFT Gallery ── */}
      <NFTGallery
        zIndex={wZ.gallery}
        onFocus={() => focusWin("gallery")}
        getNFT={getNFT}
        getTotalNFTs={getTotalNFTs}
        walletAddress={wallet.address}
      />

      {/* ── About ── */}
      <Win98Window
        title="About"
        defaultPos={{ x: 30, y: 490 }}
        width={280}
        zIndex={wZ.about}
        onFocus={() => focusWin("about")}
      >
        <div style={{ fontSize: 11, lineHeight: 1.8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <img
              src="/mochi.png"
              alt="Mochi"
              style={{
                width: 36,
                height: 36,
                objectFit: "contain",
                filter: "drop-shadow(0 0 6px rgba(255,0,200,0.6))",
              }}
            />
            <strong style={{ fontSize: 12 }}>Mochi Hall of Shame</strong>
          </div>
          <p style={{ margin: "0 0 8px" }}>
            On-chain meme game on{" "}
            <a href="https://genlayer.com" target="_blank" rel="noreferrer">
              GenLayer
            </a>
            . AI validators judge your cringe level.
          </p>
          <ul style={{ paddingLeft: 16, margin: 0 }}>
            <li>Submit confession</li>
            <li>AI roasts you on-chain</li>
            <li>Score 75+ = mint NFT</li>
            <li>Click Mochi for wisdom</li>
          </ul>
        </div>
      </Win98Window>

      {/* ── NFT Certificate Modal ── */}
      {mintedNFT && (
        <NFTCertificate
          nft={mintedNFT}
          onClose={() => setMintedNFT(null)}
        />
      )}

      {/* ── Mochi Assistant ── */}
      <MochiAssistant
        message={msg}
        mood={mood}
        onClick={() => {
          setMsg(TIPS[Math.floor(Math.random() * TIPS.length)]);
          const moods: MochiMood[] = ["smug", "happy", "angry"];
          setMood(moods[Math.floor(Math.random() * moods.length)]);
        }}
      />

      {/* ── Toasts ── */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}