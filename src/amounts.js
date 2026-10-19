// Frani Invoice — amount helpers.
// All on-wire amounts are decimal strings in the smallest unit. We convert to
// and from whole UCT using integer math (BigInt) so there is no float drift.

export function toBaseUnits(whole, decimals = 18) {
  const s = String(whole).trim();
  if (!/^\d+(\.\d+)?$/.test(s)) {
    throw new Error(`invalid amount: ${whole}`);
  }
  const [i, f = ''] = s.split('.');
  const frac = (f + '0'.repeat(decimals)).slice(0, decimals);
  return (BigInt(i) * 10n ** BigInt(decimals) + BigInt(frac || '0')).toString();
}

export function fromBaseUnits(base, decimals = 18) {
  const v = BigInt(String(base));
  const unit = 10n ** BigInt(decimals);
  const whole = v / unit;
  const frac = (v % unit).toString().padStart(decimals, '0').replace(/0+$/, '');
  return frac ? `${whole}.${frac}` : `${whole}`;
}

// Compare two base-unit strings. Returns -1, 0, or 1.
export function cmpBase(a, b) {
  const x = BigInt(a);
  const y = BigInt(b);
  return x < y ? -1 : x > y ? 1 : 0;
}

export function subBase(a, b) {
  return (BigInt(a) - BigInt(b)).toString();
}
