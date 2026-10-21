import { createClient } from "@libsql/client";

/**
 * Turso client for the shared token launchpad (server-side only).
 *
 * Tokens, balances, transactions, and presales live in a shared edge SQLite
 * database so every visitor sees the same launchpad.
 */

function client() {
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;
  if (!url || !token) {
    throw new Error("Turso is not configured (TURSO_DATABASE_URL / TURSO_AUTH_TOKEN)");
  }
  return createClient({ url, authToken: token });
}

export async function ensureTables() {
  const db = client();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS coin_tokens (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      symbol TEXT NOT NULL,
      decimals INTEGER NOT NULL DEFAULT 18,
      owner TEXT NOT NULL,
      total_supply TEXT NOT NULL DEFAULT '0',
      description TEXT NOT NULL DEFAULT '',
      website TEXT NOT NULL DEFAULT '',
      twitter TEXT NOT NULL DEFAULT '',
      telegram TEXT NOT NULL DEFAULT '',
      tax_buy INTEGER NOT NULL DEFAULT 0,
      tax_sell INTEGER NOT NULL DEFAULT 0,
      mintable INTEGER NOT NULL DEFAULT 1,
      burnable INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS coin_balances (
      token_id TEXT NOT NULL,
      address TEXT NOT NULL,
      balance TEXT NOT NULL DEFAULT '0',
      PRIMARY KEY (token_id, address)
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS coin_transactions (
      id TEXT PRIMARY KEY,
      token_id TEXT NOT NULL,
      type TEXT NOT NULL,
      from_addr TEXT,
      to_addr TEXT,
      amount TEXT NOT NULL,
      at TEXT NOT NULL
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS coin_presales (
      id TEXT PRIMARY KEY,
      token_id TEXT NOT NULL,
      creator TEXT NOT NULL,
      price TEXT NOT NULL,
      total_allocation TEXT NOT NULL,
      sold TEXT NOT NULL DEFAULT '0',
      min_buy TEXT NOT NULL DEFAULT '0',
      max_buy TEXT NOT NULL DEFAULT '0',
      start_at TEXT NOT NULL,
      end_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'upcoming',
      created_at TEXT NOT NULL
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS coin_presale_purchases (
      id TEXT PRIMARY KEY,
      presale_id TEXT NOT NULL,
      buyer TEXT NOT NULL,
      amount TEXT NOT NULL,
      cost TEXT NOT NULL,
      at TEXT NOT NULL
    )
  `);
  await db.close();
}

export interface TokenRow {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  owner: string;
  totalSupply: string;
  description: string;
  website: string;
  twitter: string;
  telegram: string;
  taxBuy: number;
  taxSell: number;
  mintable: boolean;
  burnable: boolean;
  createdAt: string;
}

export interface BalanceRow {
  tokenId: string;
  address: string;
  balance: string;
}

export interface TxRow {
  id: string;
  tokenId: string;
  type: string;
  from: string | null;
  to: string | null;
  amount: string;
  at: string;
}

export interface PresaleRow {
  id: string;
  tokenId: string;
  creator: string;
  price: string;
  totalAllocation: string;
  sold: string;
  minBuy: string;
  maxBuy: string;
  startAt: string;
  endAt: string;
  status: string;
  createdAt: string;
}

function rowToToken(r: Record<string, unknown>): TokenRow {
  return {
    id: String(r.id),
    name: String(r.name),
    symbol: String(r.symbol),
    decimals: Number(r.decimals),
    owner: String(r.owner),
    totalSupply: String(r.total_supply),
    description: String(r.description ?? ""),
    website: String(r.website ?? ""),
    twitter: String(r.twitter ?? ""),
    telegram: String(r.telegram ?? ""),
    taxBuy: Number(r.tax_buy ?? 0),
    taxSell: Number(r.tax_sell ?? 0),
    mintable: Number(r.mintable ?? 1) === 1,
    burnable: Number(r.burnable ?? 1) === 1,
    createdAt: String(r.created_at),
  };
}

function rowToTx(r: Record<string, unknown>): TxRow {
  return {
    id: String(r.id),
    tokenId: String(r.token_id),
    type: String(r.type),
    from: r.from_addr ? String(r.from_addr) : null,
    to: r.to_addr ? String(r.to_addr) : null,
    amount: String(r.amount),
    at: String(r.at),
  };
}

function rowToPresale(r: Record<string, unknown>): PresaleRow {
  return {
    id: String(r.id),
    tokenId: String(r.token_id),
    creator: String(r.creator),
    price: String(r.price),
    totalAllocation: String(r.total_allocation),
    sold: String(r.sold),
    minBuy: String(r.min_buy),
    maxBuy: String(r.max_buy),
    startAt: String(r.start_at),
    endAt: String(r.end_at),
    status: String(r.status),
    createdAt: String(r.created_at),
  };
}

export async function createToken(t: {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  owner: string;
  totalSupply: string;
  description: string;
  website: string;
  twitter: string;
  telegram: string;
  taxBuy: number;
  taxSell: number;
  mintable: boolean;
  burnable: boolean;
}) {
  const db = client();
  await db.execute({
    sql: `INSERT INTO coin_tokens
      (id, name, symbol, decimals, owner, total_supply, description, website, twitter, telegram, tax_buy, tax_sell, mintable, burnable, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      t.id, t.name, t.symbol, t.decimals, t.owner, t.totalSupply,
      t.description, t.website, t.twitter, t.telegram,
      t.taxBuy, t.taxSell, t.mintable ? 1 : 0, t.burnable ? 1 : 0,
      new Date().toISOString(),
    ],
  });
  await db.execute({
    sql: "INSERT INTO coin_balances (token_id, address, balance) VALUES (?, ?, ?)",
    args: [t.id, t.owner, t.totalSupply],
  });
  await db.execute({
    sql: "INSERT INTO coin_transactions (id, token_id, type, from_addr, to_addr, amount, at) VALUES (?, ?, 'mint', ?, ?, ?, ?)",
    args: [`tx_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e9).toString(36)}`, t.id, null, t.owner, t.totalSupply, new Date().toISOString()],
  });
  await db.close();
}

export async function listTokens(): Promise<TokenRow[]> {
  const db = client();
  const res = await db.execute("SELECT * FROM coin_tokens ORDER BY created_at DESC");
  await db.close();
  return res.rows.map((r) => rowToToken(r as unknown as Record<string, unknown>));
}

export async function getToken(id: string): Promise<TokenRow | null> {
  const db = client();
  const res = await db.execute({ sql: "SELECT * FROM coin_tokens WHERE id = ?", args: [id] });
  await db.close();
  const row = res.rows[0] as unknown as Record<string, unknown> | undefined;
  return row ? rowToToken(row) : null;
}

export async function getBalances(tokenId: string): Promise<BalanceRow[]> {
  const db = client();
  const res = await db.execute({
    sql: "SELECT * FROM coin_balances WHERE token_id = ? AND CAST(balance AS INTEGER) > 0 ORDER BY CAST(balance AS INTEGER) DESC",
    args: [tokenId],
  });
  await db.close();
  return res.rows.map((r) => ({
    tokenId: String((r as unknown as Record<string, unknown>).token_id),
    address: String((r as unknown as Record<string, unknown>).address),
    balance: String((r as unknown as Record<string, unknown>).balance),
  }));
}

export async function getTransactions(tokenId: string): Promise<TxRow[]> {
  const db = client();
  const res = await db.execute({
    sql: "SELECT * FROM coin_transactions WHERE token_id = ? ORDER BY at DESC LIMIT 100",
    args: [tokenId],
  });
  await db.close();
  return res.rows.map((r) => rowToTx(r as unknown as Record<string, unknown>));
}

export async function mintToken(tokenId: string, to: string, amount: string, by: string) {
  const db = client();
  const token = await getToken(tokenId);
  if (!token) throw new Error("Token not found");
  if (token.owner !== by) throw new Error("Only the owner can mint");
  if (!token.mintable) throw new Error("Minting is disabled for this token");

  await db.execute({
    sql: "UPDATE coin_tokens SET total_supply = CAST(total_supply AS INTEGER) + ? WHERE id = ?",
    args: [amount, tokenId],
  });
  await db.execute({
    sql: `INSERT INTO coin_balances (token_id, address, balance) VALUES (?, ?, ?)
      ON CONFLICT(token_id, address) DO UPDATE SET balance = CAST(balance AS INTEGER) + ?`,
    args: [tokenId, to, amount, amount],
  });
  await db.execute({
    sql: "INSERT INTO coin_transactions (id, token_id, type, from_addr, to_addr, amount, at) VALUES (?, ?, 'mint', ?, ?, ?, ?)",
    args: [`tx_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e9).toString(36)}`, tokenId, null, to, amount, new Date().toISOString()],
  });
  await db.close();
}

export async function transferToken(tokenId: string, from: string, to: string, amount: string) {
  const db = client();
  const token = await getToken(tokenId);
  if (!token) throw new Error("Token not found");

  const bal = await db.execute({
    sql: "SELECT balance FROM coin_balances WHERE token_id = ? AND address = ?",
    args: [tokenId, from],
  });
  const have = BigInt(String((bal.rows[0] as unknown as Record<string, unknown> | undefined)?.balance ?? "0"));
  if (have < BigInt(amount)) throw new Error("Insufficient balance");

  await db.execute({
    sql: "UPDATE coin_balances SET balance = CAST(balance AS INTEGER) - ? WHERE token_id = ? AND address = ?",
    args: [amount, tokenId, from],
  });
  await db.execute({
    sql: `INSERT INTO coin_balances (token_id, address, balance) VALUES (?, ?, ?)
      ON CONFLICT(token_id, address) DO UPDATE SET balance = CAST(balance AS INTEGER) + ?`,
    args: [tokenId, to, amount, amount],
  });
  await db.execute({
    sql: "INSERT INTO coin_transactions (id, token_id, type, from_addr, to_addr, amount, at) VALUES (?, ?, 'transfer', ?, ?, ?, ?)",
    args: [`tx_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e9).toString(36)}`, tokenId, from, to, amount, new Date().toISOString()],
  });
  await db.close();
}

export async function createPresale(p: {
  id: string;
  tokenId: string;
  creator: string;
  price: string;
  totalAllocation: string;
  minBuy: string;
  maxBuy: string;
  startAt: string;
  endAt: string;
}) {
  const db = client();
  const token = await getToken(p.tokenId);
  if (!token) throw new Error("Token not found");
  if (token.owner !== p.creator) throw new Error("Only the owner can create a presale");
  await db.execute({
    sql: `INSERT INTO coin_presales (id, token_id, creator, price, total_allocation, sold, min_buy, max_buy, start_at, end_at, status, created_at)
      VALUES (?, ?, ?, ?, ?, '0', ?, ?, ?, ?, 'upcoming', ?)`,
    args: [p.id, p.tokenId, p.creator, p.price, p.totalAllocation, p.minBuy, p.maxBuy, p.startAt, p.endAt, new Date().toISOString()],
  });
  await db.close();
}

export async function listPresales(): Promise<PresaleRow[]> {
  const db = client();
  const res = await db.execute("SELECT * FROM coin_presales ORDER BY created_at DESC");
  await db.close();
  return res.rows.map((r) => rowToPresale(r as unknown as Record<string, unknown>));
}

export async function getPresale(id: string): Promise<PresaleRow | null> {
  const db = client();
  const res = await db.execute({ sql: "SELECT * FROM coin_presales WHERE id = ?", args: [id] });
  await db.close();
  const row = res.rows[0] as unknown as Record<string, unknown> | undefined;
  return row ? rowToPresale(row) : null;
}

export async function buyPresale(presaleId: string, buyer: string, amount: string) {
  const db = client();
  const presale = await getPresale(presaleId);
  if (!presale) throw new Error("Presale not found");
  const now = Date.now();
  if (now < new Date(presale.startAt).getTime()) throw new Error("Presale hasn't started");
  if (now > new Date(presale.endAt).getTime()) throw new Error("Presale has ended");
  if (presale.status !== "upcoming" && presale.status !== "live") throw new Error("Presale is not live");

  const sold = BigInt(presale.sold);
  const total = BigInt(presale.totalAllocation);
  const amt = BigInt(amount);
  if (sold + amt > total) throw new Error("Allocation exceeded");

  const cost = (amt * BigInt(presale.price)) / 10n ** 18n;
  await db.execute({
    sql: "UPDATE coin_presales SET sold = CAST(sold AS INTEGER) + ? WHERE id = ?",
    args: [amount, presaleId],
  });
  await db.execute({
    sql: `INSERT INTO coin_balances (token_id, address, balance) VALUES (?, ?, ?)
      ON CONFLICT(token_id, address) DO UPDATE SET balance = CAST(balance AS INTEGER) + ?`,
    args: [presale.tokenId, buyer, amount, amount],
  });
  await db.execute({
    sql: "INSERT INTO coin_presale_purchases (id, presale_id, buyer, amount, cost, at) VALUES (?, ?, ?, ?, ?, ?)",
    args: [`buy_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e9).toString(36)}`, presaleId, buyer, amount, cost.toString(), new Date().toISOString()],
  });
  await db.execute({
    sql: "INSERT INTO coin_transactions (id, token_id, type, from_addr, to_addr, amount, at) VALUES (?, ?, 'presale', ?, ?, ?, ?)",
    args: [`tx_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e9).toString(36)}`, presale.tokenId, null, buyer, amount, new Date().toISOString()],
  });
  await db.close();
}
