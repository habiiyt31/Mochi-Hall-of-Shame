"use client";

import { useState, useCallback } from "react";
import type { Address, Hash } from "viem";
import {
  CONTRACT_ADDRESS,
  readClient,
  waitForReceipt,
  createGenLayerClient,
} from "@/lib/genlayer";
import type { RoastEntry, NFTMetadata, PlayerStats } from "@/types/contract";

/**
 * useMochiContract -- now wallet-aware.
 * Pass genClient from useWallet() for write calls.
 * Read calls use the public readClient (no wallet needed).
 */
export function useMochiContract(
  genClient: ReturnType<typeof createGenLayerClient> | null
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function write(functionName: string, args: unknown[]): Promise<Hash> {
    if (!genClient) throw new Error("Wallet not connected");
    const hash = (await genClient.writeContract({
      address: CONTRACT_ADDRESS,
      functionName,
      args,
      value: 0n,
    })) as Hash;
    await waitForReceipt(genClient, hash);
    return hash;
  }

  async function read<T>(functionName: string, args: unknown[] = []): Promise<T> {
    const result = await readClient.readContract({
      address: CONTRACT_ADDRESS,
      functionName,
      args,
    });
    return result as T;
  }

  const submitForRoast = useCallback(
    async (submission: string) => {
      setLoading(true);
      setError(null);
      try {
        return await write("submit_for_roast", [submission]);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [genClient]
  );

  const mintCertificate = useCallback(
    async (entryId: bigint) => {
      setLoading(true);
      setError(null);
      try {
        return await write("mint_certificate", [entryId]);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [genClient]
  );

  const getRecentEntries = useCallback(async (limit = 10): Promise<RoastEntry[]> => {
    const result = await read<RoastEntry[]>("get_recent_entries", [BigInt(limit)]);
    return Array.isArray(result) ? result : [];
  }, []);

  const getTotalEntries = useCallback(async (): Promise<bigint> => {
    const r = await read<string | number | bigint>("total_entries");
    return BigInt(r);
  }, []);

  const getNFT = useCallback(async (tokenId: bigint): Promise<NFTMetadata> => {
    return read<NFTMetadata>("get_nft", [tokenId]);
  }, []);

  const getPlayerStats = useCallback(
    async (player: Address): Promise<PlayerStats> => {
      return read<PlayerStats>("get_player_stats", [player]);
    },
    []
  );

  return {
    loading,
    error,
    submitForRoast,
    mintCertificate,
    getRecentEntries,
    getTotalEntries,
    getNFT,
    getPlayerStats,
  };
}
