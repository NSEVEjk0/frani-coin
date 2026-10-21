"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Rocket, Timer } from "lucide-react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { currentWallet } from "@/lib/wallet";

interface Presale {
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
  token?: { id: string; name: string; symbol: string; decimals: number } | null;
}

interface Token {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
}

function baseToWhole(base: string, decimals: number): string {
  const v = BigInt(base || "0");
  const unit = 10n ** BigInt(decimals);
  const whole = v / unit;
  const frac = (v % unit).toString().padStart(decimals, "0").replace(/0+$/, "");
  return frac ? `${whole}.${frac}` : whole.toString();
}

export default function PresalesPage() {
  const [presales, setPresales] = useState<Presale[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<Presale | null>(null);
  const [buyAmount, setBuyAmount] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [psRes, tkRes] = await Promise.all([
        fetch("/api/presales", { cache: "no-store" }),
        fetch("/api/tokens", { cache: "no-store" }),
      ]);
      const ps = await psRes.json();
      const tk = await tkRes.json();
      const tokenMap = new Map((tk.tokens ?? []).map((t: Token) => [t.id, t]));
      setPresales((ps.presales ?? []).map((p: Presale) => ({ ...p, token: tokenMap.get(p.tokenId) ?? null })));
      setTokens(tk.tokens ?? []);
    } catch {
      setPresales([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleBuy(e: React.FormEvent) {
    e.preventDefault();
    const wallet = currentWallet();
    if (!wallet || !buying) return;
    setBusy(true);
    try {
      const res = await fetch("/api/presales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "buy", presaleId: buying.id, buyer: wallet.address, amount: buyAmount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not buy");
      toast.success("Purchase recorded — tokens added to your balance");
      setBuying(null);
      setBuyAmount("");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not buy");
    } finally {
      setBusy(false);
    }
  }

  function statusOf(p: Presale): { label: string; variant: "success" | "warning" | "secondary" } {
    const now = Date.now();
    if (now < new Date(p.startAt).getTime()) return { label: "upcoming", variant: "secondary" };
    if (now > new Date(p.endAt).getTime()) return { label: "ended", variant: "secondary" };
    return { label: "live", variant: "success" };
  }

  return (
    <div className="relative min-h-screen">
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#070d0a] to-[#040806]" />
        <div className="grid-bg absolute inset-0" />
        <div className="scanlines absolute inset-0 opacity-40" />
      </div>
      <div className="relative z-10">
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          <h1 className="mb-1 text-2xl font-semibold tracking-tight">
            <span className="text-gradient">Presales</span>
          </h1>
          <p className="mb-6 text-sm text-muted-foreground">Early access to tokens before they're widely available.</p>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          ) : presales.length === 0 ? (
            <EmptyState
              icon={<Rocket className="h-8 w-8" />}
              title="No presales yet"
              body="Token creators can launch a presale from their token page."
            />
          ) : (
            <div className="space-y-3">
              {presales.map((p) => {
                const st = statusOf(p);
                const soldPct = p.totalAllocation && Number(p.totalAllocation) > 0
                  ? Math.min(100, Math.round((Number(p.sold) / Number(p.totalAllocation)) * 100))
                  : 0;
                return (
                  <div key={p.id} className="rounded-lg border bg-card/80 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Link href={`/token/${p.tokenId}`} className="font-semibold hover:text-primary">
                            {p.token?.symbol ?? "Token"}
                          </Link>
                          <Badge variant={st.variant} className="text-[10px]">{st.label}</Badge>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Timer className="h-3 w-3" />
                            {new Date(p.endAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {p.token?.name ?? "Unknown token"} · by <span className="font-mono">{p.creator.slice(0, 12)}…</span>
                        </p>
                        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${soldPct}%` }} />
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {soldPct}% sold · {baseToWhole(p.sold, p.token?.decimals ?? 18)} / {baseToWhole(p.totalAllocation, p.token?.decimals ?? 18)} tokens
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="font-mono text-sm">
                          {baseToWhole(p.price, 18)} UCT / token
                        </span>
                        <Button size="sm" disabled={st.label !== "live"} onClick={() => { setBuying(p); setBuyAmount(""); }}>
                          {st.label === "live" ? "Buy" : st.label === "upcoming" ? "Not started" : "Ended"}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        <Dialog open={!!buying} onOpenChange={(o) => { if (!o) setBuying(null); }}>
          <DialogContent className="max-w-md">
            {buying ? (
              <>
                <DialogHeader>
                  <DialogTitle>Buy {buying.token?.symbol ?? "tokens"}</DialogTitle>
                  <DialogDescription>
                    Price: {baseToWhole(buying.price, 18)} UCT per token
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleBuy} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="buy-amount">Amount (tokens)</Label>
                    <Input id="buy-amount" type="number" min={0} step="any" value={buyAmount} onChange={(e) => setBuyAmount(e.target.value)} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={() => setBuying(null)}>Cancel</Button>
                    <Button type="submit" disabled={busy || !buyAmount || Number(buyAmount) <= 0}>
                      {busy ? "Processing…" : "Buy"}
                    </Button>
                  </div>
                </form>
              </>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
