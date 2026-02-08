import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { NextResponse } from "next/server";
import { getNetworkTime } from "@/lib/ntp";
import { getUptime } from "@/lib/uptime";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const execFileAsync = promisify(execFile);

export async function GET() {
  const uptime = getUptime();
  const { date, host, source, warning } = await getNetworkTime();
  let chronyOk = false;
  let chronyTracking = "";
  let chronyError = "";

  try {
    const { stdout } = await execFileAsync("chronyc", ["tracking"]);
    chronyOk = true;
    chronyTracking = stdout.trim();
  } catch (error) {
    chronyError = error instanceof Error ? error.message : "chrony check failed";
  }

  const status = chronyOk ? "ok" : "degraded";
  const startedAtIso = new Date(
    date.getTime() - uptime.uptimeMs
  ).toISOString();

  return NextResponse.json(
    {
      status,
      nowIso: date.toISOString(),
      ...uptime,
      startedAtIso,
      ntp: {
        host,
        source,
        warning: warning ?? null,
      },
      chrony: {
        ok: chronyOk,
        tracking: chronyTracking,
        error: chronyError,
      },
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
