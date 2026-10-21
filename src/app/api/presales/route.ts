import { NextRequest, NextResponse } from "next/server";
import { ensureTables, createPresale, listPresales, getPresale, buyPresale } from "@/lib/turso";

export async function GET() {
  try {
    await ensureTables();
    const presales = await listPresales();
    return NextResponse.json({ presales });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not load presales" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  let body: {
    id?: string;
    tokenId?: string;
    creator?: string;
    price?: string;
    totalAllocation?: string;
    minBuy?: string;
    maxBuy?: string;
    startAt?: string;
    endAt?: string;
    action?: string;
    buyer?: string;
    amount?: string;
    presaleId?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    await ensureTables();

    // Buy into an existing presale
    if (body.action === "buy") {
      if (!body.presaleId || !body.buyer || !body.amount) {
        return NextResponse.json({ error: "presaleId, buyer, amount required" }, { status: 400 });
      }
      await buyPresale(body.presaleId, body.buyer, body.amount);
      return NextResponse.json({ ok: true });
    }

    // Create a presale
    if (!body.id || !body.tokenId || !body.creator || !body.price || !body.totalAllocation) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    await createPresale({
      id: body.id,
      tokenId: body.tokenId,
      creator: body.creator,
      price: body.price,
      totalAllocation: body.totalAllocation,
      minBuy: body.minBuy ?? "0",
      maxBuy: body.maxBuy ?? "0",
      startAt: body.startAt ?? new Date().toISOString(),
      endAt: body.endAt ?? new Date(Date.now() + 7 * 86400000).toISOString(),
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not process presale" },
      { status: 400 }
    );
  }
}
