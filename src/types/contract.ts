import type { Address } from "viem";

export type Verdict = "NOOB" | "MID" | "CRINGE" | "LEGENDARY_L" | "BASED";
export type MochiMood = "happy" | "smug" | "low_battery" | "angry";
export type GenLayerNetwork = "studionet" | "localnet";

export interface RoastEntry {
  player: Address;
  submission: string;
  roast: string;
  cringe_score: bigint;
  minted: boolean;
  timestamp: bigint;
}

export interface NFTMetadata {
  title: string;
  roast_text: string;
  cringe_score: bigint;
  owner: Address;
  entry_id: bigint;
}

export interface PlayerStats {
  roast_count: number;
  total_cringe: number;
}
