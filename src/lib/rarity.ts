export type Rarity =
  | "BASED"
  | "COMMON"
  | "UNCOMMON"
  | "RARE"
  | "EPIC"
  | "LEGENDARY"
  | "MYTHIC";

export interface RarityInfo {
  rarity: Rarity;
  color: string;
  glow: string;
  bg: string;
  border: string;
  emoji: string;
  label: string;
  description: string;
}

export function getRarity(score: number, verdict: string): RarityInfo {
  let points = score;
  if (verdict === "LEGENDARY_L") points += 20;
  else if (verdict === "CRINGE") points += 10;
  else if (verdict === "MID") points += 0;
  else if (verdict === "NOOB") points -= 5;
  else if (verdict === "BASED") points -= 15;

  if (points >= 115) return {
    rarity: "MYTHIC",
    color: "#ff00ff",
    glow: "0 0 20px rgba(255,0,255,0.8), 0 0 40px rgba(255,0,255,0.4)",
    bg: "linear-gradient(135deg, #1a001a 0%, #3d0066 50%, #1a001a 100%)",
    border: "#ff00ff",
    emoji: "👑",
    label: "MYTHIC",
    description: "Transcended cringe. You are the meme.",
  };

  if (points >= 95) return {
    rarity: "LEGENDARY",
    color: "#ffaa00",
    glow: "0 0 20px rgba(255,170,0,0.8), 0 0 40px rgba(255,170,0,0.4)",
    bg: "linear-gradient(135deg, #1a1000 0%, #4d3300 50%, #1a1000 100%)",
    border: "#ffaa00",
    emoji: "🔱",
    label: "LEGENDARY",
    description: "Hall of Fame material. Forever on-chain.",
  };

  if (points >= 75) return {
    rarity: "EPIC",
    color: "#aa00ff",
    glow: "0 0 16px rgba(170,0,255,0.7), 0 0 30px rgba(170,0,255,0.3)",
    bg: "linear-gradient(135deg, #0d0020 0%, #2d0060 50%, #0d0020 100%)",
    border: "#aa00ff",
    emoji: "⚡",
    label: "EPIC",
    description: "Certified L. Mochi is impressed.",
  };

  if (points >= 55) return {
    rarity: "RARE",
    color: "#0088ff",
    glow: "0 0 14px rgba(0,136,255,0.6), 0 0 28px rgba(0,136,255,0.3)",
    bg: "linear-gradient(135deg, #000820 0%, #001a4d 50%, #000820 100%)",
    border: "#0088ff",
    emoji: "💎",
    label: "RARE",
    description: "Genuinely cringe. Respect.",
  };

  if (points >= 35) return {
    rarity: "UNCOMMON",
    color: "#00cc66",
    glow: "0 0 12px rgba(0,204,102,0.5)",
    bg: "linear-gradient(135deg, #001a0d 0%, #003320 50%, #001a0d 100%)",
    border: "#00cc66",
    emoji: "🌿",
    label: "UNCOMMON",
    description: "Mildly cringe. You can do worse.",
  };

  if (points >= 15) return {
    rarity: "COMMON",
    color: "#aaaaaa",
    glow: "0 0 8px rgba(170,170,170,0.4)",
    bg: "linear-gradient(135deg, #111 0%, #222 50%, #111 100%)",
    border: "#888",
    emoji: "⬜",
    label: "COMMON",
    description: "Mid. Try harder next time.",
  };

  return {
    rarity: "BASED",
    color: "#00ccaa",
    glow: "0 0 10px rgba(0,204,170,0.5)",
    bg: "linear-gradient(135deg, #001a16 0%, #003328 50%, #001a16 100%)",
    border: "#00ccaa",
    emoji: "✨",
    label: "BASED",
    description: "Actually based. Mochi approves.",
  };
}