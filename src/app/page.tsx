"use client";

import Link from "next/link";
import moment from "moment-timezone";
import { useCallback, useEffect, useMemo, useState } from "react";
import { parseTimezoneConfig } from "@/lib/timezones";

type TimePayload = {
  nowIso: string;
  unix: number;
  timezone: string;
  offsetMinutes: number;
  source: "ntp";
  ntp: {
    host: string;
    source: "local" | "fallback";
    warning: string | null;
  };
};

const NTP_EXPOSED = process.env.NEXT_PUBLIC_NTP_EXPOSED === "true";
const NTP_HOST = process.env.NEXT_PUBLIC_NTP_HOST ?? "localhost";
const TIMEZONE_CONFIG = parseTimezoneConfig(
  process.env.NEXT_PUBLIC_TIMEZONES
);
const TIMEZONE_CONFIG_HINT =
  process.env.NEXT_PUBLIC_TIMEZONES ??
  "UTC,America/New_York,Europe/London,Asia/Tokyo";
const DATE_FORMAT = process.env.NEXT_PUBLIC_DATE_FORMAT ?? "YYYY-MM-DD";
const TIME_FORMAT = process.env.NEXT_PUBLIC_TIME_FORMAT ?? "HH:mm:ss";

const formatOffset = (minutes: number) => {
  const sign = minutes >= 0 ? "+" : "-";
  const abs = Math.abs(minutes);
  const hours = Math.floor(abs / 60)
    .toString()
    .padStart(2, "0");
  const mins = (abs % 60).toString().padStart(2, "0");
  return `${sign}${hours}:${mins}`;
};

export default function Home() {
  const [timeData, setTimeData] = useState<TimePayload | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [syncedAt, setSyncedAt] = useState<number | null>(null);
  const [tick, setTick] = useState(0);

  const exposureLabel = NTP_EXPOSED ? "Public" : "Private";
  const exposureTone = NTP_EXPOSED
    ? "bg-emerald-100 text-emerald-900"
    : "bg-amber-100 text-amber-900";
  const exposureCopy = NTP_EXPOSED
    ? "UDP/123 is mapped in Docker Compose. Keep a firewall in front of it."
    : "No public UDP/123 mapping. LAN access only unless you open it."

  const ntpNow = useMemo(() => {
    if (!timeData || syncedAt === null) {
      return null;
    }
    const baseMs = Date.parse(timeData.nowIso);
    const elapsedMs = Date.now() - syncedAt;
    return new Date(baseMs + elapsedMs);
  }, [timeData, syncedAt, tick]);

  const formattedTime = useMemo(() => {
    if (!ntpNow) {
      return "--";
    }
    return moment(ntpNow).format(`${DATE_FORMAT} ${TIME_FORMAT}`);
  }, [ntpNow]);

  const formattedDate = useMemo(() => {
    if (!ntpNow) {
      return "--";
    }
    return moment(ntpNow).format(DATE_FORMAT);
  }, [ntpNow]);

  const zoneSnapshots = useMemo(() => {
    if (!ntpNow) {
      return TIMEZONE_CONFIG.map((zone) => ({
        ...zone,
        time: "--:--:--",
        date: "--",
        offsetMinutes: 0,
      }));
    }

    const base = moment.utc(ntpNow);

    return TIMEZONE_CONFIG.map((zone) => {
      const now = base.clone().tz(zone.zone);
      return {
        ...zone,
        time: now.format(TIME_FORMAT),
        date: now.format(DATE_FORMAT),
        offsetMinutes: now.utcOffset(),
      };
    });
  }, [ntpNow]);

  const loadTime = useCallback(async () => {
    setStatus("loading");
    try {
      const response = await fetch("/api/time", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Failed to fetch time.");
      }
      const payload = (await response.json()) as TimePayload;
      setTimeData(payload);
      setSyncedAt(Date.now());
      setStatus("idle");
    } catch (error) {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    loadTime();
    const interval = window.setInterval(loadTime, 10000);
    return () => window.clearInterval(interval);
  }, [loadTime]);

  useEffect(() => {
    const interval = window.setInterval(() => setTick((value) => value + 1), 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="app-shell">
      <div className="hero-orb -left-30 -top-20" />
      <div className="hero-orb secondary -right-30 top-36" />
      <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col gap-16 px-6 pb-20 pt-16 sm:px-10">
        <header className="motion-rise flex flex-col gap-10">
          <div className="flex flex-wrap items-center gap-4 text-sm uppercase tracking-[0.2em] text-muted-foreground">
            <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold">
              Open-source NTP Kit
            </span>
            <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold">
              Chrony + Next.js
            </span>
          </div>
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="flex flex-col gap-8">
              <h1 className="text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
                OpenNTP: Your open-source NTP server and time API
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                OpenNTP bundles a public-ready Chrony image, a REST time API, and a
                frontend that documents whether your instance is open or private.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="#quickstart"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                >
                  Get running
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-border px-6 text-sm font-semibold text-foreground transition hover:border-foreground"
                >
                  View API Docs
                </Link>
              </div>
            </div>
            <div className="glass-panel card-glow rounded-3xl p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Time API
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold text-foreground">
                    Live NTP time
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={loadTime}
                  className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground transition hover:border-foreground"
                >
                  Refresh
                </button>
              </div>
              <div className="mt-6 grid gap-4">
                <div className="rounded-2xl border border-border bg-white/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    NTP time (Local)
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {status === "error" ? "Unavailable" : formattedTime}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-border bg-white/70 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Unix
                    </p>
                    <p className="mt-2 font-mono text-sm text-foreground">
                      {timeData?.unix ?? "--"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-white/70 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Zone
                    </p>
                    <p className="mt-2 font-mono text-sm text-foreground">
                      {timeData?.timezone ?? "--"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-white/70 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Offset
                    </p>
                    <p className="mt-2 font-mono text-sm text-foreground">
                      {timeData ? formatOffset(timeData.offsetMinutes) : "--"}
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-white/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    NTP datetime
                  </p>
                  <p className="mt-2 font-mono text-sm text-foreground">
                    {formattedTime}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Format: {DATE_FORMAT} {TIME_FORMAT}
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-white/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    NTP date
                  </p>
                  <p className="mt-2 font-mono text-sm text-foreground">
                    {formattedDate}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section id="clocks" className="grid gap-6 lg:grid-cols-1">
          <div className="glass-panel card-glow rounded-3xl p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Multi-timezone
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-foreground">
                  Digital clock wall
                </h2>
              </div>
              <span className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Moment-timezone
              </span>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {zoneSnapshots.map((zone) => (
                <div
                  key={zone.zone}
                  className="rounded-2xl border border-border bg-white/70 p-5"
                >
                  {timeData?.ntp.warning ? (
                    <div className="mb-3 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-800">
                      Fallback: {timeData.ntp.host}
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        {zone.label}
                      </p>
                      <p className="mt-2 font-mono text-xs text-muted-foreground">
                        {zone.zone}
                      </p>
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground">
                      UTC{formatOffset(zone.offsetMinutes)}
                    </p>
                  </div>
                  <div className="digital-display mt-4 rounded-2xl px-4 py-5 text-center">
                    <p className="font-digital text-3xl sm:text-4xl">
                      {zone.time}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-emerald-100/80">
                      {zone.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
