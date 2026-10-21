"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Coins, Loader2 } from "lucide-react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { currentWallet } from "@/lib/wallet";

function randomHex(len: number): string {
  return Array.from({ length: len }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
}

export default function CreateTokenPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [decimals, setDecimals] = useState("18");
  const [supply, setSupply] = useState("1000000");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");
  const [taxBuy, setTaxBuy] = useState("0");
  const [taxSell, setTaxSell] = useState("0");
  const [mintable, setMintable] = useState(true);
  const [burnable, setBurnable] = useState(true);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const wallet = currentWallet();
    if (!wallet) {
      toast.error("Connect a wallet first");
      return;
    }
    const d = Number(decimals);
    if (!name.trim() || !symbol.trim()) {
      toast.error("Name and symbol are required");
      return;
    }
    if (!Number.isInteger(d) || d < 0 || d > 36) {
      toast.error("Decimals must be 0–36");
      return;
    }
    const buy = Number(taxBuy);
    const sell = Number(taxSell);
    if (!Number.isFinite(buy) || !Number.isFinite(sell) || buy < 0 || sell < 0 || buy > 100 || sell > 100) {
      toast.error("Taxes must be 0–100");
      return;
    }

    setBusy(true);
    try {
      const id = `tok_${Date.now().toString(36)}_${randomHex(4)}`;
      const res = await fetch("/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name: name.trim(),
          symbol: symbol.trim(),
          decimals: d,
          owner: wallet.address,
          totalSupply: supply.trim() || "0",
          description: description.trim(),
          website: website.trim(),
          twitter: twitter.trim(),
          telegram: telegram.trim(),
          taxBuy: buy,
          taxSell: sell,
          mintable,
          burnable,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create token");
      toast.success(`Token ${symbol.trim().toUpperCase()} created`);
      router.push(`/token/${id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create token");
    } finally {
      setBusy(false);
    }
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
        <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
          <Button variant="ghost" size="sm" className="mb-4 gap-1.5 text-muted-foreground" onClick={() => router.push("/")}>
            <ArrowLeft className="h-4 w-4" /> Back to launchpad
          </Button>
          <h1 className="mb-1 text-2xl font-semibold tracking-tight">
            <span className="text-gradient">$ create-token</span>
          </h1>
          <p className="mb-6 text-sm text-muted-foreground">Configure your new token on Unicity testnet2.</p>

          <form onSubmit={handleCreate} className="space-y-5 rounded-lg border bg-card/80 p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="My Token" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="symbol">Symbol</Label>
                <Input id="symbol" placeholder="MTK" value={symbol} onChange={(e) => setSymbol(e.target.value)} maxLength={10} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="decimals">Decimals</Label>
                <Input id="decimals" type="number" min={0} max={36} value={decimals} onChange={(e) => setDecimals(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="supply">Initial supply</Label>
                <Input id="supply" type="number" min={0} value={supply} onChange={(e) => setSupply(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={3} placeholder="What is this token for?" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="website">Website</Label>
                <Input id="website" placeholder="https://" value={website} onChange={(e) => setWebsite(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="twitter">Twitter/X</Label>
                <Input id="twitter" placeholder="@handle" value={twitter} onChange={(e) => setTwitter(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="telegram">Telegram</Label>
                <Input id="telegram" placeholder="t.me/…" value={telegram} onChange={(e) => setTelegram(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="taxBuy">Buy tax (%)</Label>
                <Input id="taxBuy" type="number" min={0} max={100} value={taxBuy} onChange={(e) => setTaxBuy(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="taxSell">Sell tax (%)</Label>
                <Input id="taxSell" type="number" min={0} max={100} value={taxSell} onChange={(e) => setTaxSell(e.target.value)} />
              </div>
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={mintable} onChange={(e) => setMintable(e.target.checked)} className="h-4 w-4 accent-[hsl(var(--primary))]" />
                Mintable
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={burnable} onChange={(e) => setBurnable(e.target.checked)} className="h-4 w-4 accent-[hsl(var(--primary))]" />
                Burnable
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => router.push("/")}>Cancel</Button>
              <Button type="submit" disabled={busy} className="gap-2">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Coins className="h-4 w-4" />}
                {busy ? "Creating…" : "Create token"}
              </Button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
