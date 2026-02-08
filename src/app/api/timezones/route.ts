import moment from "moment-timezone";
import { NextResponse } from "next/server";
import { getNetworkTime } from "@/lib/ntp";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const { date, host, source, warning } = await getNetworkTime();
  const base = moment.utc(date);

  const timezones = moment.tz.names().map((zone) => {
    const now = base.clone().tz(zone);
    return {
      zone,
      nowIso: now.toISOString(),
      unix: now.unix(),
      offsetMinutes: now.utcOffset(),
      formatted: now.format("YYYY-MM-DD HH:mm:ss"),
    };
  });

  return NextResponse.json(
    {
      generatedAtIso: date.toISOString(),
      count: timezones.length,
      ntp: {
        host,
        source,
        warning: warning ?? null,
      },
      timezones,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
