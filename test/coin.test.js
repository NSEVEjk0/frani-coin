// Frani Coin — unit tests (plain node).
import assert from 'node:assert/strict';
import { createToken, mint, transfer, balanceOf } from '../src/coin.js';
import { Store } from '../src/store.js';

const OWNER = '0xOwner';
const ALICE = '0xAlice';
const BOB = '0xBob';

// Use a temp store (in-memory dir is fine — Store writes JSON files).
const store = new Store('/tmp/frani-coin-test');

const token = createToken(store, { name: 'Test Token', symbol: 'TST', decimals: 6, owner: OWNER });
assert.equal(token.symbol, 'TST');
assert.equal(token.decimals, 6);

// owner mints
mint(store, token, { to: ALICE, amount: '100', by: OWNER });
assert.equal(balanceOf(token, ALICE), '100000000'); // 100 * 10^6
assert.equal(token.totalSupply, '100000000');

// non-owner cannot mint
assert.throws(() => mint(store, token, { to: BOB, amount: '1', by: ALICE }), /only the token owner/);

// transfer
transfer(token, { from: ALICE, to: BOB, amount: '25' });
assert.equal(balanceOf(token, ALICE), '75000000');
assert.equal(balanceOf(token, BOB), '25000000');

// insufficient balance
assert.throws(() => transfer(token, { from: BOB, to: ALICE, amount: '100' }), /insufficient balance/);

// validation
assert.throws(() => createToken(store, { name: '', symbol: 'X', owner: OWNER }), /name/);
assert.throws(() => createToken(store, { name: 'X', symbol: '', owner: OWNER }), /symbol/);

console.log('coin.test.js — all passed');
