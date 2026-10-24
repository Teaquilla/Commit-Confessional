// src/app/api/health/route.ts
// Minimal healthcheck endpoint returning {"ok":true} without extra information.

import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ ok: true });
}
