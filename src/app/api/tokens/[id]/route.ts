import { NextRequest, NextResponse } from "next/server";
import { ensureTables, getToken, getBalances, getTransactions, mintToken, transferToken } from "@/lib/turso";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await ensureTables();
    const token = await getToken(params.id);
    if (!token) return NextResponse.json({ error: "Token not found" }, { status: 404 });
    const [balances, transactions] = await Promise.all([getBalances(params.id), getTransactions(params.id)]);
    return NextResponse.json({ token, balances, transactions });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not load token" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  let body: { action?: string; to?: string; from?: string; amount?: string; by?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    await ensureTables();
    if (body.action === "mint") {
      if (!body.to || !body.amount || !body.by) {
        return NextResponse.json({ error: "to, amount, by required" }, { status: 400 });
      }
      await mintToken(params.id, body.to, body.amount, body.by);
      return NextResponse.json({ ok: true });
    }
    if (body.action === "transfer") {
      if (!body.from || !body.to || !body.amount) {
        return NextResponse.json({ error: "from, to, amount required" }, { status: 400 });
      }
      await transferToken(params.id, body.from, body.to, body.amount);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not perform action" },
      { status: 400 }
    );
  }
}
