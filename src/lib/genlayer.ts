"use client";

import { createClient } from "genlayer-js";
import { studionet, localnet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";
import type { Hash } from "genlayer-js/types";
import type { Address } from "viem";

const network = process.env.NEXT_PUBLIC_GENLAYER_NETWORK ?? "studionet";
export const CHAIN = network === "localnet" ? localnet : studionet;

export const CONTRACT_ADDRESS = (
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "0x0000000000000000000000000000000000000000"
) as Address;

export const readClient = createClient({ chain: CHAIN });

export function createGenLayerClient(address: Address) {
  return createClient({
    chain: CHAIN,
    account: address,
  });
}

export async function waitForReceipt(
  client: ReturnType<typeof createClient>,
  hash: Hash
) {
  return client.waitForTransactionReceipt({
    hash,
    status: TransactionStatus.ACCEPTED,
  });
}