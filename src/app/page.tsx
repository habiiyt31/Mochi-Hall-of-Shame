"use client";

import { useState, useEffect, useCallback, type CSSProperties } from "react";
import dynamic from "next/dynamic";
import Win98Window from "@/components/Win98Window";
import MochiAssistant from "@/components/MochiAssistant";
import WalletConnect from "@/components/WalletConnect";
import { useWallet } from "@/hooks/useWallet";
import { useMochiContract } from "@/hooks/useMochiContract";
import type { RoastEntry, MochiMood, Verdict } from "@/types/contract";

const AlphabetGlobe = dynamic(() => import("@/components/AlphabetGlobe"), {
  ssr: false,
});

const VERDICT_COLOR: Record<Verdict, string> = {
  NOOB: "#888",
  MID: "#cc9900",
  CRINGE: "#ff3366",
  LEGENDARY_L: "#cc00ff",
  BASED: "#00ccaa",
};

const TIPS = [
  "Skill issue. Just kidding... unless? lol",
  "Touch grass occasionally, ngmi otherwise",
  "Mid take. Try harder next time",
  "Based. But also still cringe somehow.",
  "wkwk anjir parah lo bro",
];

function verdictFromScore(score: number): Verdict {
  if (score >= 80) return "LEGENDARY_L";
  if (score >= 60) return "CRINGE";
  if (score >= 40) return "MID";
  if (score >= 20) return "NOOB";
  return "BASED";
}

const BTN: CSSProperties = {
  padding: "4px 12px",
  background: "#c0c0c0",
  border: "2px solid",
  borderColor: "#fff #404040 #404040 #fff",
  fontFamily: "inherit",
  fontSize: 12,
  fontWeight: "bold",
  cursor: "pointer",
};

export default function HomePage() {
  const wallet = useWallet();
  const { loading, error, submitForRoast, mintCertificate, getRecentEntries } =
    useMochiContract(wallet.genClient);

  const [text, setText] = useState("");
  const [entries, setEntries] = useState<RoastEntry[]>([]);
  const [topZ, setTopZ] = useState(20);
  const [wZ, setWZ] = useState({ submit: 11, hall: 12, info: 10 });
  const [msg, setMsg] = useState<string | null>(
    "Yo. Connect your wallet and drop your most cringe digital habit."
  );
  const [mood, setMood] = useState<MochiMood>("smug");

  const focusWin = useCallback(
    (k: keyof typeof wZ) => {
      setTopZ((z) => z + 1);
      setWZ((s) => ({ ...s, [k]: topZ + 1 }));
    },
    [topZ]
  );

  const refresh = useCallback(async () => {
    try {
      const r = await getRecentEntries(10);
      setEntries(r.slice().reverse());
    } catch {
      /* silent on first load */
    }
  }, [getRecentEntries]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Update Mochi message when wallet connects/disconnects
  useEffect(() => {
    if (wallet.connected && wallet.address) {
      setMsg(
        "Wallet connected! Now confess your digital sins and I will roast you on-chain. wkwk"
      );
      setMood("happy");
    } else {
      setMsg("Yo. Connect your wallet and drop your most cringe digital habit.");
      setMood("smug");
    }
  }, [wallet.connected, wallet.address]);

  async function handleSubmit() {
    if (!wallet.connected) {
      setMsg("Bro connect your wallet first, ngmi like this");
      setMood("angry");
      return;
    }
    if (text.trim().length < 3) {
      setMsg("Bro at least give me 3 letters to work with, ngmi");
      return;
    }
    setMood("smug");
    setMsg("Hold up... validators are vibing on your L right now");
    try {
      await submitForRoast(text);
      setText("");
      await refresh();
      setMood("happy");
      setMsg("Done. Your shame is now permanent on the blockchain.");
    } catch (e) {
      setMood("angry");
      setMsg(
        "Error: " +
          (e instanceof Error ? e.message : String(e)).slice(0, 120)
      );
    }
  }

  async function handleMint(entryId: bigint) {
    if (!wallet.connected) {
      setMsg("Connect wallet to mint your certificate");
      return;
    }
    setMsg("Minting your Sertifikat Lulus TK Digital...");
    try {
      await mintCertificate(entryId);
      setMood("happy");
      setMsg("Certified L. The blockchain remembers.");
      await refresh();
    } catch (e) {
      setMood("angry");
      setMsg(
        "Mint failed: " +
          (e instanceof Error ? e.message : String(e)).slice(0, 120)
      );
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#008080",
        position: "relative",
        overflow: "hidden",
        paddingTop: 32, // space for fixed wallet bar
      }}
    >
      {/* Fixed wallet bar at top */}
      <WalletConnect wallet={wallet} />

      {/* Globe background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, opacity: 0.85, pointerEvents: "none" }}>
        <AlphabetGlobe
          onBurst={() => {
            setMood("smug");
            setMsg("Pixel burst! That is all you, champ");
          }}
        />
      </div>

      {/* Submit window */}
      <Win98Window
        title="Mochi Hall of Shame - Submit Your L"
        defaultPos={{ x: 60, y: 60 }}
        width={460}
        zIndex={wZ.submit}
        onFocus={() => focusWin("submit")}
      >
        {!wallet.connected ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <p style={{ fontSize: 12, marginBottom: 12 }}>
              Connect your wallet to submit a roast.
            </p>
            <button type="button" onClick={wallet.connect} style={BTN}>
              {wallet.connecting ? "Connecting..." : "Connect Wallet"}
            </button>
            {wallet.error && (
              <p style={{ fontSize: 11, color: "#c00", marginTop: 8 }}>
                {wallet.error}
              </p>
            )}
          </div>
        ) : (
          <>
            <p style={{ marginTop: 0, fontSize: 12 }}>
              Confess a weird digital habit, cringe tech opinion, or
              productivity-goblin behavior. Mochi will roast you on-chain.
            </p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. I have 247 browser tabs open and refuse to use bookmarks"
              rows={5}
              maxLength={400}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: 6,
                border: "2px solid",
                borderColor: "#404040 #fff #fff #404040",
                background: "#fff",
                fontFamily: "inherit",
                fontSize: 13,
                resize: "vertical",
              }}
            />
            <div
              style={{
                marginTop: 8,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 11, color: "#444" }}>
                {text.length} / 400
              </span>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                style={BTN}
              >
                {loading ? "Validating L..." : "Get Roasted"}
              </button>
            </div>
          </>
        )}
        {error && (
          <div
            style={{
              marginTop: 8,
              padding: 6,
              background: "#ffeeee",
              border: "1px solid #c00",
              fontSize: 12,
            }}
          >
            {error}
          </div>
        )}
      </Win98Window>

      {/* Hall of Shame window */}
      <Win98Window
        title="Hall of Shame - Permanent Record"
        defaultPos={{ x: 560, y: 60 }}
        width={520}
        zIndex={wZ.hall}
        onFocus={() => focusWin("hall")}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <span style={{ fontSize: 12 }}>{entries.length} entries</span>
          <button type="button" onClick={refresh} style={BTN}>
            Refresh
          </button>
        </div>
        <div
          style={{
            maxHeight: 380,
            overflowY: "auto",
            border: "2px solid",
            borderColor: "#404040 #fff #fff #404040",
            background: "#fff",
          }}
        >
          {entries.length === 0 && (
            <div
              style={{
                padding: 20,
                fontSize: 12,
                color: "#666",
                textAlign: "center",
              }}
            >
              No entries yet. Be the first.
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
                  padding: 10,
                  borderBottom: "1px solid #ccc",
                  fontSize: 12,
                }}
              >
                <div style={{ fontStyle: "italic", color: "#555" }}>
                  &ldquo;{entry.submission}&rdquo;
                </div>
                <div
                  style={{
                    marginTop: 6,
                    padding: 8,
                    background: "#fffbe0",
                    border: "1px solid #cca",
                    fontFamily: '"Comic Sans MS",cursive',
                  }}
                >
                  {entry.roast}
                </div>
                <div
                  style={{
                    marginTop: 6,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <span
                      style={{
                        padding: "2px 6px",
                        background: VERDICT_COLOR[verdict],
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: "bold",
                      }}
                    >
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
                      style={BTN}
                    >
                      Mint Certificate
                    </button>
                  )}
                  {entry.minted && (
                    <span style={{ fontSize: 11, color: "#0a0" }}>
                      Certified L
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Win98Window>

      {/* About window */}
      <Win98Window
        title="About Mochi"
        defaultPos={{ x: 280, y: 460 }}
        width={400}
        zIndex={wZ.info}
        onFocus={() => focusWin("info")}
      >
        <p style={{ fontSize: 12, marginTop: 0 }}>
          <strong>Mochi Hall of Shame</strong> is a meme-game on{" "}
          <a href="https://genlayer.com" target="_blank" rel="noreferrer">
            GenLayer
          </a>
          . Connect any EIP-1193 wallet (MetaMask, Rabby, Coinbase Wallet).
        </p>
        <ul style={{ fontSize: 12, paddingLeft: 18, margin: 0 }}>
          <li>Connect wallet -&gt; submit confession -&gt; on-chain LLM roast</li>
          <li>Cringe score &gt;=75 -&gt; mint Sertifikat Lulus TK Digital NFT</li>
          <li>Only you can mint your own certificate</li>
          <li>No SARA, no profanity. Digital L only.</li>
        </ul>
      </Win98Window>

      <MochiAssistant
        message={msg}
        mood={mood}
        onClick={() => {
          setMsg(TIPS[Math.floor(Math.random() * TIPS.length)]);
          const moods: MochiMood[] = ["smug", "happy", "angry"];
          setMood(moods[Math.floor(Math.random() * moods.length)]);
        }}
      />
    </div>
  );
}
