"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Coins, Search, TrendingUp } from "lucide-react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";

interface Token {
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

function baseToWhole(base: string, decimals: number): string {
  const v = BigInt(base || "0");
  const unit = 10n ** BigInt(decimals);
  const whole = v / unit;
  const frac = (v % unit).toString().padStart(decimals, "0").replace(/0+$/, "");
  return frac ? `${whole}.${frac}` : whole.toString();
}

export default function LaunchpadHome() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/tokens", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled) {
          if (data.tokens) setTokens(data.tokens);
          else setError(data.error || "Could not load tokens");
        }
      } catch {
        if (!cancelled) setError("Could not reach the registry");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = tokens.filter((t) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      t.name.toLowerCase().includes(q) ||
      t.symbol.toLowerCase().includes(q) ||
      t.owner.toLowerCase().includes(q)
    );
  });

  return (
    <div className="relative min-h-screen">
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#070d0a] to-[#040806]" />
        <div className="grid-bg absolute inset-0" />
        <div className="scanlines absolute inset-0 opacity-40" />
      </div>

      <div className="relative z-10">
        <Header />

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          {/* hero */}
          <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                The token <span className="text-gradient">launchpad</span>
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Create, mint, and presale tokens on Unicity testnet2.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search tokens…" className="w-56 pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <Button asChild className="gap-1.5">
                <Link href="/create">
                  <Coins className="h-4 w-4" /> Create token
                </Link>
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : error ? (
            <EmptyState icon={<Coins className="h-8 w-8" />} title="Couldn't load tokens" body={error} action={<Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>} />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<Coins className="h-8 w-8" />}
              title={query ? "No matching tokens" : "No tokens launched yet"}
              body={query ? "Try a different search." : "Be the first to launch a token."}
              action={query ? undefined : <Button asChild><Link href="/create">Launch a token</Link></Button>}
            />
          ) : (
            <div className="space-y-3">
              {filtered.map((token) => (
                <Link
                  key={token.id}
                  href={`/token/${token.id}`}
                  className="group flex flex-wrap items-center gap-4 rounded-lg border bg-card/80 px-5 py-4 transition-colors hover:border-primary/40"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-primary/30 bg-primary/10 font-bold text-primary">
                    {token.symbol.slice(0, 3)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{token.symbol}</span>
                      <span className="text-xs text-muted-foreground">{token.name}</span>
                      {token.taxBuy > 0 || token.taxSell > 0 ? (
                        <Badge variant="warning" className="text-[9px]">
                          {token.taxBuy}% buy / {token.taxSell}% sell
                        </Badge>
                      ) : null}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>supply <span className="font-mono text-foreground">{baseToWhole(token.totalSupply, token.decimals)}</span></span>
                      <span>owner <span className="font-mono">{token.owner.slice(0, 12)}…</span></span>
                      <span>launched {new Date(token.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    View <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          )}

          {/* stats strip */}
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Tokens launched", tokens.length],
              ["Total supply", tokens.reduce((a, t) => a + Number(baseToWhole(t.totalSupply, t.decimals)), 0).toLocaleString()],
              ["Network", "testnet2"],
              ["Status", "live"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border bg-card/80 p-4 text-center">
                <div className="font-mono text-lg font-semibold text-primary">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </main>

        <footer className="border-t border-border/60">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6">
            <span>Frani Coin · token launchpad on Unicity testnet2 · made by CRYPTFRANI</span>
            <span className="font-mono">$ frani-coin --help</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
