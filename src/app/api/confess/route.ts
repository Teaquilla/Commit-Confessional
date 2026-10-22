// src/app/api/confess/route.ts
// Next.js Route Handler for /api/confess. Thin wrapper around handleConfess.

import { NextResponse } from "next/server";
import { handleConfess } from "../../../lib/confess.ts";

export const runtime = "nodejs";
export const maxDuration = 30; // hanya berpengaruh di Vercel

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const result = await handleConfess(rawBody);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    console.error("[API_ERROR] AI_GENERATION_FAILED attempts=0");
    return NextResponse.json(
      {
        error: {
          code: "AI_GENERATION_FAILED",
          message:
            "Something went wrong and no report was filed. Please try again.",
        },
      },
      { status: 502 }
    );
  }
}
