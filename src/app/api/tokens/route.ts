import { NextRequest, NextResponse } from "next/server";
import { ensureTables, createToken, listTokens } from "@/lib/turso";

export async function GET() {
  try {
    await ensureTables();
    const tokens = await listTokens();
    return NextResponse.json({ tokens });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not load tokens" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  let body: {
    id?: string;
    name?: string;
    symbol?: string;
    decimals?: number;
    owner?: string;
    totalSupply?: string;
    description?: string;
    website?: string;
    twitter?: string;
    telegram?: string;
    taxBuy?: number;
    taxSell?: number;
    mintable?: boolean;
    burnable?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.id || !body.name || !body.symbol || !body.owner) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const decimals = Number(body.decimals ?? 18);
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 36) {
    return NextResponse.json({ error: "Decimals must be 0–36" }, { status: 400 });
  }

  try {
    await ensureTables();
    await createToken({
      id: body.id,
      name: body.name,
      symbol: body.symbol.toUpperCase(),
      decimals,
      owner: body.owner,
      totalSupply: body.totalSupply ?? "0",
      description: body.description ?? "",
      website: body.website ?? "",
      twitter: body.twitter ?? "",
      telegram: body.telegram ?? "",
      taxBuy: Number(body.taxBuy ?? 0),
      taxSell: Number(body.taxSell ?? 0),
      mintable: body.mintable !== false,
      burnable: body.burnable !== false,
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not create token" },
      { status: 400 }
    );
  }
}
