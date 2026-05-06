"use client";

import { useState, useCallback } from "react";
import type { Address } from "viem";
import {
  CONTRACT_ADDRESS,
  readClient,
  waitForReceipt,
  createGenLayerClient,
} from "@/lib/genlayer";
import type { RoastEntry, NFTMetadata, PlayerStats } from "@/types/contract";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

export function useMochiContract(
  genClient: ReturnType<typeof createGenLayerClient> | null
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function write(functionName: string, args: unknown[]): Promise<string> {
    if (!genClient) throw new Error("Wallet not connected");
    const client = genClient as AnyClient;
    const hash = (await client.writeContract({
      address: CONTRACT_ADDRESS,
      functionName,
      args,
      value: 0n,
    })) as string;

    try {
      await waitForReceipt(client, hash as AnyClient);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const isTimeout =
        msg.toLowerCase().includes("timed out") ||
        msg.toLowerCase().includes("timeout");
      if (!isTimeout) throw e;
    }
    return hash;
  }

  async function read<T>(
    functionName: string,
    args: unknown[] = []
  ): Promise<T> {
    const client = readClient as AnyClient;
    const result = await client.readContract({
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

  const getRecentEntries = useCallback(
    async (limit = 10): Promise<RoastEntry[]> => {
      const result = await read<RoastEntry[]>("get_recent_entries", [
        BigInt(limit),
      ]);
      return Array.isArray(result) ? result : [];
    },
    []
  );

  const getTotalEntries = useCallback(async (): Promise<bigint> => {
    const r = await read<string | number | bigint>("total_entries");
    return BigInt(r);
  }, []);

  const getTotalNFTs = useCallback(async (): Promise<bigint> => {
    const r = await read<string | number | bigint>("total_nfts");
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
    getTotalNFTs,
    getNFT,
    getPlayerStats,
  };
}