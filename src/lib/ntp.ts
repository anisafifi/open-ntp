import ntpClient from "ntp-client";

type NetworkTimeResult = {
  date: Date;
  host: string;
  source: "local" | "fallback";
  warning?: string;
};

const DEFAULT_PRIMARY_HOST = "127.0.0.1";
const DEFAULT_FALLBACK_HOST = "time.google.com";
const DEFAULT_TIMEOUT_MS = 2500;

const getTimeFromHost = (host: string, timeoutMs: number) =>
  new Promise<Date>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`NTP timeout for ${host}`));
    }, timeoutMs);

    ntpClient.getNetworkTime(host, 123, (error, date) => {
      clearTimeout(timeoutId);
      if (error || !date) {
        reject(error ?? new Error(`NTP error for ${host}`));
        return;
      }
      resolve(date);
    });
  });

export const getNetworkTime = async (): Promise<NetworkTimeResult> => {
  const primaryHost = process.env.NTP_SERVER_HOST ?? DEFAULT_PRIMARY_HOST;
  const fallbackHost = process.env.NTP_FALLBACK_HOST ?? DEFAULT_FALLBACK_HOST;
  const timeoutMs = Number(process.env.NTP_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);

  try {
    const date = await getTimeFromHost(primaryHost, timeoutMs);
    return { date, host: primaryHost, source: "local" };
  } catch (error) {
    const warning =
      error instanceof Error
        ? error.message
        : "Primary NTP host unavailable";

    const date = await getTimeFromHost(fallbackHost, timeoutMs);
    return {
      date,
      host: fallbackHost,
      source: "fallback",
      warning: `Primary NTP host failed. Using ${fallbackHost}. ${warning}`,
    };
  }
};
