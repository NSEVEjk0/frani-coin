"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Coins, Plus, Send, TerminalSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Token {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  owner: string;
  totalSupply: string;
  balances: Record<string, string>;
  createdAt: string;
}

const STORE_KEY = "frani-coin:tokens";

function readTokens(): Token[] {
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as Token[]) : [];
  } catch {
    return [];
  }
}

function writeTokens(tokens: Token[]) {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(tokens));
  } catch {
    /* ignore */
  }
}

function randomHex(len: number): string {
  return Array.from({ length: len }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
}

function baseToWhole(base: string, decimals: number): string {
  const v = BigInt(base || "0");
  const unit = 10n ** BigInt(decimals);
  const whole = v / unit;
  const frac = (v % unit).toString().padStart(decimals, "0").replace(/0+$/, "");
  return frac ? `${whole}.${frac}` : whole.toString();
}

function wholeToBase(whole: string, decimals: number): bigint {
  const s = String(whole).trim();
  if (!/^\d+(\.\d+)?$/.test(s)) throw new Error(`invalid amount: ${whole}`);
  const [i, f = ""] = s.split(".");
  const frac = (f + "0".repeat(decimals)).slice(0, decimals);
  return BigInt(i) * 10n ** BigInt(decimals) + BigInt(frac || "0");
}

export default function CoinPage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [mintOpen, setMintOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [activeToken, setActiveToken] = useState<Token | null>(null);
  const [busy, setBusy] = useState(false);

  // create form
  const [cName, setCName] = useState("");
  const [cSymbol, setCSymbol] = useState("");
  const [cDecimals, setCDecimals] = useState("18");
  const [cSupply, setCSupply] = useState("1000000");
  // mint form
  const [mTo, setMTo] = useState("");
  const [mAmount, setMAmount] = useState("");
  // send form
  const [sTo, setSTo] = useState("");
  const [sAmount, setSAmount] = useState("");

  useEffect(() => {
    setTokens(readTokens());
    setLoading(false);
  }, []);

  const persist = useCallback((next: Token[]) => {
    writeTokens(next);
    setTokens(next);
  }, []);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const decimals = Number(cDecimals);
    if (!cName.trim() || !cSymbol.trim()) {
      toast.error("Name and symbol are required");
      return;
    }
    if (!Number.isInteger(decimals) || decimals < 0 || decimals > 36) {
      toast.error("Decimals must be 0–36");
      return;
    }
    const owner = `DIRECT://${randomHex(66)}`;
    const token: Token = {
      id: `tok_${Date.now().toString(36)}_${randomHex(4)}`,
      name: cName.trim(),
      symbol: cSymbol.trim().toUpperCase(),
      decimals,
      owner,
      totalSupply: "0",
      balances: { [owner]: "0" },
      createdAt: new Date().toISOString(),
    };
    // initial supply
    try {
      const base = wholeToBase(cSupply || "0", decimals);
      if (base > 0n) {
        token.totalSupply = base.toString();
        token.balances[owner] = base.toString();
      }
    } catch {
      /* ignore bad supply */
    }
    persist([token, ...tokens]);
    setCreateOpen(false);
    setCName(""); setCSymbol(""); setCDecimals("18"); setCSupply("1000000");
    toast.success(`Token ${token.symbol} created`);
  }

  function handleMint(e: React.FormEvent) {
    e.preventDefault();
    if (!activeToken || !mTo.trim() || !mAmount) return;
    try {
      const base = wholeToBase(mAmount, activeToken.decimals);
      const next = { ...activeToken };
      next.totalSupply = (BigInt(next.totalSupply) + base).toString();
      next.balances[mTo.trim()] = (BigInt(next.balances[mTo.trim()] ?? "0") + base).toString();
      persist(tokens.map((t) => (t.id === next.id ? next : t)));
      setMintOpen(false);
      setMTo(""); setMAmount("");
      toast.success(`Minted ${mAmount} ${next.symbol}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid amount");
    }
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!activeToken || !sTo.trim() || !sAmount) return;
    try {
      const base = wholeToBase(sAmount, activeToken.decimals);
      const have = BigInt(activeToken.balances[activeToken.owner] ?? "0");
      if (have < base) {
        toast.error("Insufficient balance");
        return;
      }
      const next = { ...activeToken };
      next.balances[activeToken.owner] = (have - base).toString();
      next.balances[sTo.trim()] = (BigInt(next.balances[sTo.trim()] ?? "0") + base).toString();
      persist(tokens.map((t) => (t.id === next.id ? next : t)));
      setSendOpen(false);
      setSTo(""); setSAmount("");
      toast.success(`Sent ${sAmount} ${next.symbol}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid amount");
    }
  }

  const totalMinted = useMemo(
    () => tokens.reduce((acc, t) => acc + Number(baseToWhole(t.totalSupply, t.decimals)), 0),
    [tokens]
  );

  return (
    <div className="relative min-h-screen">
      {/* backdrop */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#070d0a] to-[#040806]" />
        <div className="grid-bg absolute inset-0" />
        <div className="scanlines absolute inset-0 opacity-40" />
        <div
          className="absolute left-1/2 top-0 h-64 w-[60vw] -translate-x-1/2 rounded-full bg-primary/5 blur-[100px]"
        />
      </div>

      <div className="relative z-10">
        {/* header */}
        <header className="sticky top-0 z-40 border-b border-border/60 glass">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded border border-primary/40 bg-primary/10 text-primary">
                <Coins className="h-4 w-4" />
              </span>
              <span className="text-sm font-semibold tracking-tight">
                Frani <span className="text-gradient">Coin</span>
              </span>
              <span className="hidden rounded border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground sm:inline">
                testnet2
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="hidden sm:inline">
                <span className="text-primary">▮</span> console ready
              </span>
              <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
                <Plus className="h-3.5 w-3.5" /> New token
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          {/* status line */}
          <div className="mb-6 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary animate-blink" />
              network: unicity testnet2
            </span>
            <span>tokens: {tokens.length}</span>
            <span>total supply: {totalMinted.toLocaleString()} UCT-equivalent</span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : tokens.length === 0 ? (
            <div className="flex flex-col items-center rounded-lg border border-dashed border-border px-8 py-20 text-center">
              <TerminalSquare className="h-10 w-10 text-primary/60" />
              <h2 className="mt-4 font-semibold">No tokens yet</h2>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Create your first token to start minting and sending.
              </p>
              <Button className="mt-6 gap-2" onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4" /> Create a token
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {tokens.map((token) => {
                const supply = baseToWhole(token.totalSupply, token.decimals);
                const ownerBal = baseToWhole(token.balances[token.owner] ?? "0", token.decimals);
                return (
                  <div key={token.id} className="rounded-lg border bg-card/80 transition-colors hover:border-primary/40">
                    <div className="flex flex-wrap items-center gap-4 px-5 py-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{token.symbol}</span>
                          <span className="text-xs text-muted-foreground">{token.name}</span>
                          <Badge variant="outline" className="font-mono text-[10px]">
                            {token.decimals} decimals
                          </Badge>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span>supply <span className="font-mono text-foreground">{supply}</span></span>
                          <span>owner balance <span className="font-mono text-foreground">{ownerBal}</span></span>
                          <span className="font-mono">owner {token.owner.slice(0, 12)}…</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => { setActiveToken(token); setMintOpen(true); }}>
                          Mint
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => { setActiveToken(token); setSendOpen(true); }}>
                          <Send className="h-3.5 w-3.5" /> Send
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        <footer className="border-t border-border/60">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6">
            <span>Frani Coin · token console on Unicity testnet2 · made by CRYPTFRANI</span>
            <span className="font-mono">$ frani-coin --help</span>
          </div>
        </footer>
      </div>

      {/* create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-mono">$ create-token</DialogTitle>
            <DialogDescription>Configure your new token.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="c-name">Name</Label>
                <Input id="c-name" placeholder="My Token" value={cName} onChange={(e) => setCName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-symbol">Symbol</Label>
                <Input id="c-symbol" placeholder="MTK" value={cSymbol} onChange={(e) => setCSymbol(e.target.value)} maxLength={8} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="c-decimals">Decimals</Label>
                <Input id="c-decimals" type="number" min={0} max={36} value={cDecimals} onChange={(e) => setCDecimals(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-supply">Initial supply</Label>
                <Input id="c-supply" type="number" min={0} value={cSupply} onChange={(e) => setCSupply(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={busy}>Create token</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* mint dialog */}
      <Dialog open={mintOpen} onOpenChange={setMintOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-mono">$ mint</DialogTitle>
            <DialogDescription>
              {activeToken ? `${activeToken.symbol} · supply ${baseToWhole(activeToken.totalSupply, activeToken.decimals)}` : ""}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleMint} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="m-to">To (address)</Label>
              <Input id="m-to" placeholder="DIRECT://…" value={mTo} onChange={(e) => setMTo(e.target.value)} className="font-mono text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-amount">Amount</Label>
              <Input id="m-amount" type="number" min={0} step="any" placeholder="1000" value={mAmount} onChange={(e) => setMAmount(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" onClick={() => setMintOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={busy}>Mint</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* send dialog */}
      <Dialog open={sendOpen} onOpenChange={setSendOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-mono">$ send</DialogTitle>
            <DialogDescription>
              {activeToken ? `${activeToken.symbol} · owner balance ${baseToWhole(activeToken.balances[activeToken.owner] ?? "0", activeToken.decimals)}` : ""}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSend} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="s-to">To (address)</Label>
              <Input id="s-to" placeholder="DIRECT://…" value={sTo} onChange={(e) => setSTo(e.target.value)} className="font-mono text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-amount">Amount</Label>
              <Input id="s-amount" type="number" min={0} step="any" placeholder="100" value={sAmount} onChange={(e) => setSAmount(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" onClick={() => setSendOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={busy} className="gap-1.5">
                <Send className="h-3.5 w-3.5" /> Send
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
