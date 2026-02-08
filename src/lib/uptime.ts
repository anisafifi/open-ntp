export const getUptime = () => {
  const uptimeSeconds = Math.max(0, Math.floor(process.uptime()));
  const uptimeMs = uptimeSeconds * 1000;
  return {
    uptimeMs,
    uptimeSeconds,
  };
};
