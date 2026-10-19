# Frani Coin

A token mint platform on Unicity testnet2. Create a token, mint units, send,
and check balances — all under your own wallet identity.

Made by **CRYPTFRANI**. Owner / creator: **Itachi**.

---

## Track

Payments and markets.

## Is it Agentic?

No. Frani Coin creates tokens and moves units under fixed rules. No autonomous
behaviour, no model in the loop.

## Runs on AstridOS?

No.

## Live on-network

- Network: **testnet2**
- Each deployment holds its own wallet and prints its address at startup.

## SDK features used

| Feature | Where |
|---|---|
| Wallet identity | `src/wallet.js` (Sphere SDK) |
| Token model (concept) | UCT coin id + decimals, mirrored for custom tokens |

## Commands

```bash
npm run new -- --name "My Token" --symbol MTK
npm run mint -- <tokenId> --to 0x… --amount 100 --by 0xOwner
npm run balance -- <tokenId> 0x…
npm run send -- <tokenId> --from 0x… --to 0x… --amount 10
npm run list
```
