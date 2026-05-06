"use client";

import { useState, useCallback, useEffect } from "react";
import type { Address } from "viem";
import { createGenLayerClient } from "@/lib/genlayer";

export interface WalletState {
  address: Address | null;
  connected: boolean;
  connecting: boolean;
  error: string | null;
  genClient: ReturnType<typeof createGenLayerClient> | null;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    connected: false,
    connecting: false,
    error: null,
    genClient: null,
  });

  function buildClient(address: Address) {
    const genClient = createGenLayerClient(address);
    setState({
      address,
      connected: true,
      connecting: false,
      error: null,
      genClient,
    });
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const eth = (window as any).ethereum;
    if (!eth) return;
    eth
      .request({ method: "eth_accounts" })
      .then((accounts: string[]) => {
        if (accounts.length > 0) buildClient(accounts[0] as Address);
      })
      .catch(() => {});
  }, []);

  const connect = useCallback(async () => {
  const eth = (window as any).ethereum;
  if (!eth) {
    setState((s) => ({ ...s, error: "No wallet found. Install MetaMask." }));
    return;
  }
  setState((s) => ({ ...s, connecting: true, error: null }));
  try {
    // Switch dulu, kalau belum ada baru add
    try {
      await eth.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xf21f" }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await eth.request({
            method: "wallet_addEthereumChain",
            params: [{
            chainId: "0xf21f",
            chainName: "GenLayer Studionet",
            nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
            rpcUrls: ["https://studio.genlayer.com/api"],
            blockExplorerUrls: ["https://explorer-studio.genlayer.com"],
          }],
          });
        } catch { /* user tolak */ }
      }
    }

    const accounts: string[] = await eth.request({
      method: "eth_requestAccounts",
    });
    buildClient(accounts[0] as Address);
  } catch (e) {
    setState((s) => ({
      ...s,
      connecting: false,
      error: e instanceof Error ? e.message : "Connection rejected",
    }));
  }
}, []);

  const disconnect = useCallback(() => {
    setState({
      address: null,
      connected: false,
      connecting: false,
      error: null,
      genClient: null,
    });
  }, []);

  return { ...state, connect, disconnect };
}