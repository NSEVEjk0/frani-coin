// Frani Coin — token mint platform domain logic.
// Create a token, mint units, transfer, and check balances. All amounts are
// BigInt base units (decimal strings). Pure functions over the Store.

import { toBaseUnits, fromBaseUnits, cmpBase, subBase } from './amounts.js';

export function newId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e9).toString(36)}`;
}

export function createToken(store, { name, symbol, decimals = 18, owner }) {
  const symbolClean = String(symbol || '').trim().toUpperCase();
  if (!name || !String(name).trim()) throw new Error('a token needs a name');
  if (!symbolClean) throw new Error('a token needs a symbol');
  if (!owner) throw new Error('a token needs an owner address');
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 36) {
    throw new Error('decimals must be an integer 0–36');
  }
  const token = {
    id: newId('tok'),
    name: String(name).trim(),
    symbol: symbolClean,
    decimals,
    owner,
    totalSupply: '0',
    createdAt: new Date().toISOString(),
    balances: {},
  };
  token.balances[owner] = '0';
  return token;
}

export async function persistToken(store, token) {
  await store.save(token);
  return token;
}

export async function getToken(store, id) {
  return store.get(id);
}

export async function listTokens(store) {
  return store.list();
}

export function mint(store, token, { to, amount, by }) {
  if (!token) throw new Error('token not found');
  if (by !== token.owner) throw new Error('only the token owner can mint');
  const base = toBaseUnits(amount, token.decimals);
  token.totalSupply = (BigInt(token.totalSupply) + BigInt(base)).toString();
  token.balances[to] = (BigInt(token.balances[to] || '0') + BigInt(base)).toString();
  return base;
}

export function balanceOf(token, address) {
  if (!token) throw new Error('token not found');
  return token.balances[address] || '0';
}

export function transfer(token, { from, to, amount }) {
  if (!token) throw new Error('token not found');
  if (from === to) throw new Error('cannot send to yourself');
  const base = toBaseUnits(amount, token.decimals);
  const have = token.balances[from] || '0';
  if (cmpBase(have, base) < 0) throw new Error('insufficient balance');
  token.balances[from] = subBase(have, base);
  token.balances[to] = (BigInt(token.balances[to] || '0') + BigInt(base)).toString();
  return base;
}

export function renderToken(token) {
  const supply = fromBaseUnits(token.totalSupply, token.decimals);
  return `${token.symbol} (${token.name}) · decimals ${token.decimals} · supply ${supply} · owner ${token.owner}`;
}
