"use client";

/**
 * Wallet connect for the token launchpad — same pattern as mint.
 * Local mnemonic derivation always works; Sphere Connect for existing wallets.
 */

import {
  generateMnemonic,
  identityFromMnemonicSync,
  deriveAddressInfo,
  getAddressId,
} from "@unicitylabs/sphere-sdk";
import {
  autoConnect,
  hasExtension,
  isInIframe,
  type AutoConnectResult,
} from "@unicitylabs/sphere-sdk/connect/browser";

export interface Wallet {
  address: string;
  nametag: string;
  connectedAt: string;
  kind: "unicity" | "connect" | "guest";
  generatedMnemonic?: string;
}

const WALLET_KEY = "frani-coin:wallet";
const MNEMONIC_KEY = "frani-coin:mnemonic";
const BASE_PATH = "m/44'/0'/0'";

function randomAddress(): string {
  return `DIRECT://${Array.from({ length: 66 }, () =>
    "0123456789abcdef"[Math.floor(Math.random() * 16)]
  ).join("")}`;
}

export function addressFromMnemonic(mnemonic: string): { address: string; addressId: string } {
  const mk = identityFromMnemonicSync(mnemonic.trim());
  const info = deriveAddressInfo(mk, BASE_PATH, 0, false);
  const address = `DIRECT://${info.publicKey}` as const;
  return { address, addressId: getAddressId(address) };
}

export function isValidMnemonic(phrase: string): boolean {
  const words = phrase.trim().split(/\s+/);
  return words.length === 12 || words.length === 24;
}

function store(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function connectWallet(input?: { mnemonic?: string }): Wallet {
  const mnemonic = input?.mnemonic?.trim() || generateMnemonic(128);
  if (!isValidMnemonic(mnemonic)) {
    throw new Error("That recovery phrase isn't valid. Check the words and their order.");
  }
  const { address } = addressFromMnemonic(mnemonic);
  try {
    window.localStorage.setItem(MNEMONIC_KEY, mnemonic);
  } catch {
    /* ignore */
  }
  const wallet: Wallet = {
    address,
    nametag: `wallet_${address.slice(-6)}`,
    connectedAt: new Date().toISOString(),
    kind: "unicity",
    generatedMnemonic: !input?.mnemonic ? mnemonic : undefined,
  };
  store(WALLET_KEY, wallet);
  return wallet;
}

export async function connectExistingWallet(): Promise<Wallet> {
  if (!hasExtension() && !isInIframe()) {
    throw new Error("No Unicity wallet detected. Install the wallet extension or open this site inside it.");
  }
  const result: AutoConnectResult = await autoConnect({
    dapp: { name: "Frani Coin", description: "Token launchpad on Unicity", url: "https://frani-coin-console.vercel.app" },
    network: { id: 4, name: "testnet2" },
    permissions: ["identity:read", "balance:read", "transfer:request"],
  });
  const identity = result.connection.identity;
  if (!identity?.directAddress) throw new Error("Connected, but the wallet did not share an address");
  const wallet: Wallet = {
    address: identity.directAddress,
    nametag: identity.nametag || `wallet_${identity.directAddress.slice(-6)}`,
    connectedAt: new Date().toISOString(),
    kind: "connect",
  };
  store(WALLET_KEY, wallet);
  return wallet;
}

export function currentWallet(): Wallet | null {
  return load<Wallet | null>(WALLET_KEY, null);
}

export function connectGuestWallet(): Wallet {
  const wallet: Wallet = {
    address: randomAddress(),
    nametag: `guest_${Math.floor(Math.random() * 900 + 100)}`,
    connectedAt: new Date().toISOString(),
    kind: "guest",
  };
  store(WALLET_KEY, wallet);
  return wallet;
}

export function disconnectWallet() {
  try {
    window.localStorage.removeItem(WALLET_KEY);
    window.localStorage.removeItem(MNEMONIC_KEY);
  } catch {
    /* ignore */
  }
}

/** Copy the wallet's private key (for real Unicity wallets). */
export function copyPrivateKey(): string {
  const mnemonic = (() => {
    try {
      return window.localStorage.getItem(MNEMONIC_KEY);
    } catch {
      return null;
    }
  })();
  if (!mnemonic || !isValidMnemonic(mnemonic)) {
    throw new Error("No wallet key available");
  }
  const { address } = addressFromMnemonic(mnemonic);
  void address;
  const mk = identityFromMnemonicSync(mnemonic.trim());
  const info = deriveAddressInfo(mk, BASE_PATH, 0, false);
  return `0x${info.privateKey}`;
}
