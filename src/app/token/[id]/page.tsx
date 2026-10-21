"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Coins, Rocket, Send } from "lucide-react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { currentWallet } from "@/lib/wallet";

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

interface Balance {
  tokenId: string;
  address: string;
  balance: string;
}

interface Tx {
  id: string;
  tokenId: string;
  type: string;
  from: string | null;
  to: string | null;
  amount: string;
  at: string;
}

function baseToWhole(base: string, decimals: number): string {
  const v = BigInt(base || "0");
  const unit = 10n ** BigInt(decimals);
  const whole = v / unit;
  const frac = (v % unit).toString().padStart(decimals, "0").replace(/0+$/, "");
  return frac ? `${whole}.${frac}` : whole.toString();
}

export default function TokenDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [token, setToken] = useState<Token | null>(null);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mintOpen, setMintOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [presaleOpen, setPresaleOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [mTo, setMTo] = useState("");
  const [mAmount, setMAmount] = useState("");
  const [sTo, setSTo] = useState("");
  const [sAmount, setSAmount] = useState("");
  const [pPrice, setPPrice] = useState("");
  const [pAllocation, setPAllocation] = useState("");
  const [pDays, setPDays] = useState("7");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/tokens/${id}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load token");
      setToken(data.token);
      setBalances(data.balances ?? []);
      setTransactions(data.transactions ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load token");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleMint(e: React.FormEvent) {
    e.preventDefault();
    const wallet = currentWallet();
    if (!wallet || !token) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/tokens/${token.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mint", to: mTo.trim(), amount: mAmount, by: wallet.address }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not mint");
      toast.success(`Minted ${mAmount} ${token.symbol}`);
      setMintOpen(false); setMTo(""); setMAmount("");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not mint");
    } finally {
      setBusy(false);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const wallet = currentWallet();
    if (!wallet || !token) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/tokens/${token.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "transfer", from: wallet.address, to: sTo.trim(), amount: sAmount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not send");
      toast.success(`Sent ${sAmount} ${token.symbol}`);
      setSendOpen(false); setSTo(""); setSAmount("");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send");
    } finally {
      setBusy(false);
    }
  }

  async function handleCreatePresale(e: React.FormEvent) {
    e.preventDefault();
    const wallet = currentWallet();
    if (!wallet || !token) return;
    setBusy(true);
    try {
      const res = await fetch("/api/presales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: `ps_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e9).toString(36)}`,
          tokenId: token.id,
          creator: wallet.address,
          price: pPrice,
          totalAllocation: pAllocation,
          minBuy: "0",
          maxBuy: "0",
          startAt: new Date().toISOString(),
          endAt: new Date(Date.now() + Number(pDays) * 86400000).toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create presale");
      toast.success("Presale created — it's now listed on the Presales page");
      setPresaleOpen(false); setPPrice(""); setPAllocation(""); setPDays("7");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create presale");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="relative min-h-screen">
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-4 h-24 w-full rounded-lg" />
          <Skeleton className="mt-4 h-40 w-full rounded-lg" />
        </main>
      </div>
    );
  }

  if (error || !token) {
    return (
      <div className="relative min-h-screen">
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6">
          <p className="text-muted-foreground">{error || "Token not found"}</p>
          <Button className="mt-4" variant="outline" onClick={() => router.push("/")}>Back to launchpad</Button>
        </main>
      </div>
    );
  }

  const wallet = currentWallet();
  const isOwner = wallet?.address === token.owner;
  const myBalance = balances.find((b) => b.address === wallet?.address)?.balance ?? "0";

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
          <Button variant="ghost" size="sm" className="mb-4 gap-1.5 text-muted-foreground" onClick={() => router.push("/")}>
            <ArrowLeft className="h-4 w-4" /> Back to launchpad
          </Button>

          {/* token header */}
          <div className="flex flex-wrap items-start gap-5 rounded-lg border bg-card/80 p-6">
            <div className="flex h-16 w-16 items-center justify-center rounded border border-primary/30 bg-primary/10 text-2xl font-bold text-primary">
              {token.symbol.slice(0, 3)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold">{token.symbol}</h1>
                <span className="text-sm text-muted-foreground">{token.name}</span>
                <Badge variant="outline" className="font-mono text-[10px]">{token.decimals} decimals</Badge>
                {token.taxBuy > 0 || token.taxSell > 0 ? (
                  <Badge variant="warning" className="text-[10px]">{token.taxBuy}% buy / {token.taxSell}% sell</Badge>
                ) : null}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{token.description || "No description."}</p>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
                <span>supply <span className="font-mono text-foreground">{baseToWhole(token.totalSupply, token.decimals)}</span></span>
                <span>owner <span className="font-mono">{token.owner.slice(0, 14)}…</span></span>
                {token.website ? <a href={token.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">website</a> : null}
                {token.twitter ? <a href={`https://x.com/${token.twitter.replace(/^@/, "")}`} target="_blank" rel="noreferrer" className="text-primary hover:underline">{token.twitter}</a> : null}
                {token.telegram ? <a href={`https://t.me/${token.telegram.replace(/^t\.me\//, "")}`} target="_blank" rel="noreferrer" className="text-primary hover:underline">telegram</a> : null}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {wallet ? (
                <>
                  <span className="font-mono text-sm">
                    my balance: <span className="text-primary">{baseToWhole(myBalance, token.decimals)}</span>
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setSendOpen(true)} className="gap-1.5">
                      <Send className="h-3.5 w-3.5" /> Send
                    </Button>
                    {isOwner ? (
                      <>
                        <Button size="sm" variant="outline" onClick={() => setMintOpen(true)}>Mint</Button>
                        <Button size="sm" onClick={() => setPresaleOpen(true)} className="gap-1.5">
                          <Rocket className="h-3.5 w-3.5" /> Presale
                        </Button>
                      </>
                    ) : null}
                  </div>
                </>
              ) : (
                <span className="text-xs text-muted-foreground">Connect a wallet to interact</span>
              )}
            </div>
          </div>

          {/* holders */}
          <div className="mt-6 rounded-lg border bg-card/80">
            <div className="border-b border-border px-5 py-3">
              <h2 className="text-sm font-semibold">Holders ({balances.length})</h2>
            </div>
            <div className="divide-y divide-border">
              {balances.slice(0, 10).map((b) => (
                <div key={b.address} className="flex items-center justify-between px-5 py-2.5 text-sm">
                  <span className="font-mono text-xs text-muted-foreground">{b.address.slice(0, 16)}…</span>
                  <span className="font-mono">{baseToWhole(b.balance, token.decimals)} {token.symbol}</span>
                </div>
              ))}
              {balances.length === 0 ? (
                <p className="px-5 py-4 text-sm text-muted-foreground">No holders yet.</p>
              ) : null}
            </div>
          </div>

          {/* transactions */}
          <div className="mt-6 rounded-lg border bg-card/80">
            <div className="border-b border-border px-5 py-3">
              <h2 className="text-sm font-semibold">Transactions ({transactions.length})</h2>
            </div>
            <div className="divide-y divide-border">
              {transactions.slice(0, 15).map((tx) => (
                <div key={tx.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-2.5 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant={tx.type === "mint" ? "success" : tx.type === "presale" ? "warning" : "secondary"} className="font-mono text-[9px]">
                      {tx.type}
                    </Badge>
                    <span className="font-mono text-xs text-muted-foreground">
                      {tx.from ? `${tx.from.slice(0, 10)}… → ` : ""}{tx.to ? `${tx.to.slice(0, 10)}…` : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono">{baseToWhole(tx.amount, token.decimals)} {token.symbol}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(tx.at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              {transactions.length === 0 ? (
                <p className="px-5 py-4 text-sm text-muted-foreground">No transactions yet.</p>
              ) : null}
            </div>
          </div>
        </main>

        {/* dialogs */}
        <Dialog open={mintOpen} onOpenChange={setMintOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-mono">$ mint</DialogTitle>
              <DialogDescription>Mint new {token.symbol} to an address.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleMint} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="m-to">To (address)</Label>
                <Input id="m-to" placeholder="DIRECT://…" value={mTo} onChange={(e) => setMTo(e.target.value)} className="font-mono text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-amount">Amount</Label>
                <Input id="m-amount" type="number" min={0} step="any" value={mAmount} onChange={(e) => setMAmount(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setMintOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={busy}>Mint</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={sendOpen} onOpenChange={setSendOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-mono">$ send</DialogTitle>
              <DialogDescription>Send {token.symbol} from your wallet.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSend} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="s-to">To (address)</Label>
                <Input id="s-to" placeholder="DIRECT://…" value={sTo} onChange={(e) => setSTo(e.target.value)} className="font-mono text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="s-amount">Amount</Label>
                <Input id="s-amount" type="number" min={0} step="any" value={sAmount} onChange={(e) => setSAmount(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setSendOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={busy} className="gap-1.5">
                  <Send className="h-3.5 w-3.5" /> Send
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={presaleOpen} onOpenChange={setPresaleOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-mono">$ presale</DialogTitle>
              <DialogDescription>Launch a presale for {token.symbol}.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreatePresale} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="p-price">Price (UCT per token)</Label>
                  <Input id="p-price" type="number" min={0} step="any" placeholder="0.001" value={pPrice} onChange={(e) => setPPrice(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="p-alloc">Allocation (tokens)</Label>
                  <Input id="p-alloc" type="number" min={0} placeholder="100000" value={pAllocation} onChange={(e) => setPAllocation(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-days">Duration (days)</Label>
                <Input id="p-days" type="number" min={1} max={90} value={pDays} onChange={(e) => setPDays(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setPresaleOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={busy} className="gap-1.5">
                  <Rocket className="h-3.5 w-3.5" /> Launch presale
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
