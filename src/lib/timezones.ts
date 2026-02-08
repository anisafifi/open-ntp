export type TimezoneConfig = {
  label: string;
  zone: string;
};

const DEFAULT_TIMEZONES: TimezoneConfig[] = [
  { label: "UTC", zone: "UTC" },
  { label: "Bangladesh", zone: "Asia/Dhaka" },
  { label: "New York", zone: "America/New_York" },
  { label: "London", zone: "Europe/London" },
  { label: "Tokyo", zone: "Asia/Tokyo" },
];

export const parseTimezoneConfig = (raw?: string | null) => {
  if (!raw) {
    return DEFAULT_TIMEZONES;
  }

  const entries = raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!entries.length) {
    return DEFAULT_TIMEZONES;
  }

  return entries.map((entry) => {
    const [label, zone] = entry.split("|").map((part) => part.trim());

    if (zone) {
      return { label: label || zone, zone };
    }

    return { label: entry, zone: entry };
  });
};

export const getTimezoneConfig = () =>
  parseTimezoneConfig(process.env.NEXT_PUBLIC_TIMEZONES);
