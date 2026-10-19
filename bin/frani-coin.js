#!/usr/bin/env node
// Frani Coin — CLI + daemon entrypoint.
// Made by CRYPTFRANI. Owner / creator: Itachi. Unicity testnet2 only.

import process from 'node:process';
import { config } from '../src/config.js';
import { openWallet, closeWallet } from '../src/wallet.js';
import { Store } from '../src/store.js';
import { createToken, persistToken, getToken, listTokens, mint, balanceOf, transfer, renderToken } from '../src/coin.js';

const log = (...a) => console.log(new Date().toISOString(), ...a);

export const HELP = `Frani Coin — token mint platform on Unicity testnet2

Usage:
  frani-coin new --name "My Token" --symbol MTK [--decimals 18] [--owner <address>]
  frani-coin mint <tokenId> --to <address> --amount <whole> [--by <owner>]
  frani-coin balance <tokenId> <address>
  frani-coin send <tokenId> --from <address> --to <address> --amount <whole>
  frani-coin list
  frani-coin about
  frani-coin help
`;

export const aboutText = `Frani Coin — create and manage tokens on Unicity testnet2.
Made by CRYPTFRANI. Owner / creator: Itachi.
Uses the Sphere SDK wallet for identity; tokens live in a local JSON store.
`;

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const eq = a.indexOf('=');
      if (eq !== -1) out[a.slice(2, eq)] = a.slice(eq + 1);
      else if (argv[i + 1] && !argv[i + 1].startsWith('--')) out[a.slice(2)] = argv[++i];
      else out[a.slice(2)] = true;
    } else out._.push(a);
  }
  return out;
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const args = parseArgs(rest);
  const store = new Store(config.tokensDir);

  switch (cmd) {
    case 'new': {
      const owner = args.owner || (await openWallet()).address;
      const token = createToken(store, {
        name: args.name,
        symbol: args.symbol,
        decimals: args.decimals !== undefined ? Number(args.decimals) : 18,
        owner,
      });
      await persistToken(store, token);
      console.log(`Created ${renderToken(token)}`);
      console.log(`Token id: ${token.id}`);
      break;
    }
    case 'mint': {
      const id = rest[0];
      const token = await getToken(store, id);
      const by = args.by || (await openWallet()).address;
      const base = mint(store, token, { to: args.to, amount: args.amount, by });
      await persistToken(store, token);
      console.log(`Minted ${args.amount} ${token.symbol} → ${args.to} (${base} base units)`);
      break;
    }
    case 'balance': {
      const token = await getToken(store, rest[0]);
      console.log(fromBaseUnits(balanceOf(token, rest[1]), token.decimals));
      break;
    }
    case 'send': {
      const token = await getToken(store, rest[0]);
      const base = transfer(token, { from: args.from, to: args.to, amount: args.amount });
      await persistToken(store, token);
      console.log(`Sent ${args.amount} ${token.symbol} ${args.from} → ${args.to} (${base} base units)`);
      break;
    }
    case 'list': {
      const tokens = await listTokens(store);
      if (tokens.length === 0) console.log('No tokens yet.');
      for (const t of tokens) console.log(`${t.id}  ${renderToken(t)}`);
      break;
    }
    case 'about':
      console.log(aboutText);
      break;
    case 'help':
    case undefined:
      console.log(HELP);
      break;
    default:
      console.error(`Unknown command: ${cmd}`);
      console.log(HELP);
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
