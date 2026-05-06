"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type CSSProperties,
} from "react";
import Win98Window from "@/components/Win98Window";
import Taskbar, { type TaskbarWindow } from "@/components/Taskbar";
import MochiAssistant from "@/components/MochiAssistant";
import BackgroundVibe from "@/components/BackgroundVibe";
import NFTCertificate from "@/components/NFTCertificate";
import NFTGallery from "@/components/NFTGallery";
import LoadingDots from "@/components/LoadingDots";
import Toast, { type ToastItem, type ToastType } from "@/components/Toast";
import { useWallet } from "@/hooks/useWallet";
import { useMochiContract } from "@/hooks/useMochiContract";
import { getRarity } from "@/lib/rarity";
import type { RoastEntry, NFTMetadata, MochiMood } from "@/types/contract";

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

const MOCHI_INLINE: CSSProperties = {
  width: 18,
  height: 18,
  objectFit: "contain",
  mixBlendMode: "screen",
  verticalAlign: "middle",
  flexShrink: 0,
};

type WinId = "submit" | "hall" | "gallery" | "about";

interface WinState {
  minimized: boolean;
  zIndex: number;
}

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
  const [wins, setWins] = useState<Record<WinId, WinState>>({
    submit:  { minimized: false, zIndex: 13 },
    hall:    { minimized: false, zIndex: 12 },
    gallery: { minimized: false, zIndex: 11 },
    about:   { minimized: false, zIndex: 10 },
  });
  const [msg, setMsg] = useState<string | null>(
    "Yo! Connect your wallet and confess your most cringe digital habit."
  );
  const [mood, setMood] = useState<MochiMood>("smug");
  const [mintedNFT, setMintedNFT] = useState<NFTMetadata | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastId = useRef(0);

  const pushToast = useCallback((type: ToastType, message: string, duration?: number) => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, type, message, duration }]);
    return id;
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const focusWin = useCallback((id: WinId) => {
    setTopZ((z) => {
      const next = z + 1;
      setWins((s) => ({ ...s, [id]: { minimized: false, zIndex: next } }));
      return next;
    });
  }, []);

  const closeWin = useCallback((id: WinId) => {
    setWins((s) => ({ ...s, [id]: { ...s[id], minimized: true } }));
  }, []);

  const handleTaskClick = useCallback((id: string) => {
    const winId = id as WinId;
    setWins((s) => {
      if (s[winId].minimized) {
        setTopZ((z) => {
          const next = z + 1;
          setWins((prev) => ({ ...prev, [winId]: { minimized: false, zIndex: next } }));
          return next;
        });
        return s;
      }
      return { ...s, [winId]: { ...s[winId], minimized: true } };
    });
  }, []);

  // Read entries — works without wallet (uses readClient)
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
    const lid = pushToast("loading", "Submitting to blockchain... validators are judging you");
    setMood("smug");
    setMsg("Hold up, validators are vibing on your L...");
    const submitted = text;
    setText("");
    try {
      await submitForRoast(submitted);
      dismissToast(lid);
      pushToast("success", "Roasted! Your shame is now permanent on-chain.", 5000);
      setMood("happy");
      setMsg("Done. Refreshing to show your roast...");
      for (let i = 0; i < 8; i++) {
        await new Promise((r) => setTimeout(r, 3000));
        await refresh();
      }
    } catch (e) {
      dismissToast(lid);
      const em = e instanceof Error ? e.message : String(e);
      const isTimeout = em.toLowerCase().includes("timed out") || em.toLowerCase().includes("timeout");
      if (isTimeout) {
        pushToast("info", "Transaction submitted! Auto-refreshing...", 6000);
        setMood("smug");
        setMsg("Tx submitted! Auto-refreshing...");
        for (let i = 0; i < 6; i++) {
          await new Promise((r) => setTimeout(r, 4000));
          await refresh();
        }
      } else {
        pushToast("error", em.slice(0, 100));
        setMood("angry");
        setMsg("Error: " + em.slice(0, 80));
      }
    }
  }

  async function handleMint(entryId: bigint) {
    if (!wallet.connected) { pushToast("error", "Connect wallet to mint"); return; }
    const lid = pushToast("loading", "Minting your Mochi's Certified L...");
    setMsg("Minting your certificate of shame...");
    try {
      await mintCertificate(entryId);
      dismissToast(lid);
      pushToast("success", "NFT minted! Welcome to the Hall of Legends.", 5000);
      setMood("happy");
      setMsg("Certified L. Blockchain remembers forever.");
      await new Promise((r) => setTimeout(r, 2000));
      try {
        const total = await getTotalNFTs();
        if (total > 0n) setMintedNFT(await getNFT(total - 1n));
      } catch { /* silent */ }
      await refresh();
    } catch (e) {
      dismissToast(lid);
      const em = e instanceof Error ? e.message : String(e);
      const isTimeout = em.toLowerCase().includes("timed out") || em.toLowerCase().includes("timeout");
      if (isTimeout) {
        pushToast("info", "Mint submitted! Checking in a moment...", 5000);
        setTimeout(async () => {
          try {
            const total = await getTotalNFTs();
            if (total > 0n) setMintedNFT(await getNFT(total - 1n));
            await refresh();
          } catch { /* silent */ }
        }, 8000);
      } else {
        pushToast("error", "Mint failed: " + em.slice(0, 80));
        setMood("angry");
      }
    }
  }

  const taskbarWins: TaskbarWindow[] = [
    { id: "submit",  title: "Submit Your L",  minimized: wins.submit.minimized,  active: wins.submit.zIndex  === topZ },
    { id: "hall",    title: "Hall of Shame",  minimized: wins.hall.minimized,    active: wins.hall.zIndex    === topZ },
    { id: "gallery", title: "NFT Gallery",    minimized: wins.gallery.minimized, active: wins.gallery.zIndex === topZ },
    { id: "about",   title: "About",          minimized: wins.about.minimized,   active: wins.about.zIndex   === topZ },
  ];

  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden", paddingBottom: 40 }}>
      <BackgroundVibe />

      {/* Submit — shows connect screen if no wallet, form if connected */}
      <Win98Window
        id="submit"
        title="Submit Your L"
        defaultPos={{ x: 30, y: 40 }}
        defaultSize={{ w: 440, h: 420 }}
        zIndex={wins.submit.zIndex}
        isMinimized={wins.submit.minimized}
        onFocus={() => focusWin("submit")}
        onClose={() => closeWin("submit")}
      >
        {!wallet.connected ? (
          <div style={{ textAlign: "center", padding: "20px 8px" }}>
            <img src="/mochi.png" alt="Mochi" style={{
              width: 80, height: 80, objectFit: "contain",
              mixBlendMode: "screen",
              filter: "drop-shadow(0 0 12px rgba(255,0,200,0.7))",
              display: "block", margin: "0 auto 12px",
            }} />
            <p style={{ fontSize: 13, fontWeight: "bold", marginBottom: 6 }}>
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
            <div style={{ background: "#fff", border: "2px solid", borderColor: "#404040 #fff #fff #404040", padding: "6px 10px", marginBottom: 10, fontSize: 11, color: "#444" }}>
              Any score = Mint NFT &nbsp;|&nbsp; Score 95+ = LEGENDARY
            </div>
            <div style={{ marginBottom: 8 }}>
              <button type="button"
                onClick={() => setText(EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)])}
                style={{ ...BTN, fontSize: 11, padding: "3px 10px" }}>
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
                width: "100%", boxSizing: "border-box",
                padding: 8, border: "2px solid",
                borderColor: "#404040 #fff #fff #404040",
                background: loading ? "#eee" : "#fff",
                fontFamily: "inherit", fontSize: 13,
                resize: "vertical", minHeight: 90,
              }}
            />
            <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#666" }}>{text.length} / 400</span>
              <button type="button" onClick={handleSubmit} disabled={loading}
                style={{ ...BTN_PRIMARY, opacity: loading ? 0.7 : 1, cursor: loading ? "wait" : "pointer" }}>
                {loading ? <LoadingDots text="Roasting" /> : "Get Roasted →"}
              </button>
            </div>
          </>
        )}
      </Win98Window>

      {/* Hall of Shame — visible without wallet */}
      <Win98Window
        id="hall"
        title="Hall of Shame"
        defaultPos={{ x: 500, y: 40 }}
        defaultSize={{ w: 500, h: 520 }}
        zIndex={wins.hall.zIndex}
        isMinimized={wins.hall.minimized}
        onFocus={() => focusWin("hall")}
        onClose={() => closeWin("hall")}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 12 }}>
            <strong>{entries.length}</strong> entries — auto refresh 15s
          </span>
          <button type="button" onClick={refresh} style={BTN}>Refresh</button>
        </div>
        <div style={{ height: "calc(100% - 44px)", overflowY: "auto", border: "2px solid", borderColor: "#404040 #fff #fff #404040", background: "#fff" }}>
          {entries.length === 0 && (
            <div style={{ padding: 28, textAlign: "center", color: "#666", fontSize: 13 }}>
              <img src="/mochi.png" alt="" style={{ width: 40, height: 40, objectFit: "contain", mixBlendMode: "screen", display: "block", margin: "0 auto 8px" }} />
              No entries yet. Be the first to get roasted.
            </div>
          )}
          {entries.map((entry, i) => {
            const score = Number(entry.cringe_score);
            const rarity = getRarity(score, "");
            const entryId = BigInt(entries.length - 1 - i);
            const isOwn = wallet.address &&
              entry.player.toLowerCase() === wallet.address.toLowerCase();
            return (
              <div key={i} style={{ padding: 12, borderBottom: "1px solid #ddd", fontSize: 12, background: isOwn ? "#f0f8ff" : "transparent" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ fontStyle: "italic", color: "#555", flex: 1 }}>
                    &ldquo;{entry.submission}&rdquo;
                  </div>
                  {isOwn && <span style={{ fontSize: 9, color: "#0a0", fontWeight: "bold" }}>YOU</span>}
                </div>
                <div style={{ marginTop: 8, padding: 10, background: "#fffbe0", borderLeft: `4px solid ${rarity.color}`, fontFamily: '"Comic Sans MS",cursive', fontSize: 12, lineHeight: 1.5, display: "flex", alignItems: "flex-start", gap: 6 }}>
                  <img src="/mochi.png" alt="" style={MOCHI_INLINE} />
                  <span>{entry.roast}</span>
                </div>
                <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                  <div>
                    <span style={{ padding: "2px 8px", background: rarity.color, color: "#fff", fontSize: 10, fontWeight: "bold" }}>
                      {rarity.emoji} {rarity.label}
                    </span>
                    <span style={{ marginLeft: 8, fontSize: 11 }}>
                      Cringe: <strong>{score}/100</strong>
                    </span>
                  </div>
                  {/* Mint button — show for own entries not yet minted, any score */}
                  {isOwn && !entry.minted && (
                    <button type="button" onClick={() => handleMint(entryId)} style={BTN_PRIMARY}>
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

      {/* NFT Gallery — visible without wallet */}
      <NFTGallery
        zIndex={wins.gallery.zIndex}
        onFocus={() => focusWin("gallery")}
        getNFT={getNFT}
        getTotalNFTs={getTotalNFTs}
        walletAddress={wallet.address}
        isMinimized={wins.gallery.minimized}
        onClose={() => closeWin("gallery")}
      />

      {/* About */}
      <Win98Window
        id="about"
        title="About"
        defaultPos={{ x: 30, y: 490 }}
        defaultSize={{ w: 300, h: 220 }}
        zIndex={wins.about.zIndex}
        isMinimized={wins.about.minimized}
        onFocus={() => focusWin("about")}
        onClose={() => closeWin("about")}
      >
        <div style={{ fontSize: 11, lineHeight: 1.8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <img src="/mochi.png" alt="Mochi" style={{
              width: 36, height: 36, objectFit: "contain",
              mixBlendMode: "screen",
              filter: "drop-shadow(0 0 6px rgba(255,0,200,0.6))",
            }} />
            <strong style={{ fontSize: 12 }}>Mochi Hall of Shame</strong>
          </div>
          <p style={{ margin: "0 0 8px" }}>
            On-chain meme game on{" "}
            <a href="https://genlayer.com" target="_blank" rel="noreferrer">GenLayer</a>.
            AI validators judge your cringe level.
          </p>
          <ul style={{ paddingLeft: 16, margin: 0 }}>
            <li>Submit confession</li>
            <li>AI roasts you on-chain</li>
            <li>Any score = mint NFT</li>
            <li>Click Mochi for wisdom</li>
          </ul>
        </div>
      </Win98Window>

      {/* NFT Certificate Modal */}
      {mintedNFT && (
        <NFTCertificate nft={mintedNFT} onClose={() => setMintedNFT(null)} />
      )}

      {/* Mochi Assistant */}
      <MochiAssistant
        message={msg}
        mood={mood}
        onClick={() => {
          setMsg(TIPS[Math.floor(Math.random() * TIPS.length)]);
          const moods: MochiMood[] = ["smug", "happy", "angry"];
          setMood(moods[Math.floor(Math.random() * moods.length)]);
        }}
      />

      {/* Taskbar */}
      <Taskbar
        windows={taskbarWins}
        onClickTask={handleTaskClick}
        walletAddress={wallet.address}
        onConnect={wallet.connect}
        onDisconnect={wallet.disconnect}
        connecting={wallet.connecting}
      />

      {/* Toasts */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}