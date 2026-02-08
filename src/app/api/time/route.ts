import { NextResponse } from "next/server";
import { getNetworkTime } from "@/lib/ntp";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const { date, host, source, warning } = await getNetworkTime();
  const now = new Date(date);
  const payload = {
    nowIso: now.toISOString(),
    unix: Math.floor(now.getTime() / 1000),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    offsetMinutes: -now.getTimezoneOffset(),
    source: "ntp" as const,
    ntp: {
      host,
      source,
      warning: warning ?? null,
    },
  };

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
