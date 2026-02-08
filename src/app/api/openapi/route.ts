import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const spec = {
    openapi: "3.0.3",
    info: {
      title: "OpenNTP API",
      version: "1.0.0",
      description: "NTP-backed time endpoints for OpenNTP.",
    },
    servers: [{ url: "/" }],
    paths: {
      "/api/time": {
        get: {
          summary: "Get NTP time",
          responses: {
            "200": {
              description: "Current NTP time",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      nowIso: { type: "string", format: "date-time" },
                      unix: { type: "integer" },
                      timezone: { type: "string" },
                      offsetMinutes: { type: "integer" },
                      source: { type: "string", enum: ["ntp"] },
                      ntp: {
                        type: "object",
                        properties: {
                          host: { type: "string" },
                          source: { type: "string", enum: ["local", "fallback"] },
                          warning: { type: ["string", "null"] },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/timezones": {
        get: {
          summary: "Get all timezone times",
          responses: {
            "200": {
              description: "All moment-timezone values",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      generatedAtIso: { type: "string", format: "date-time" },
                      count: { type: "integer" },
                      ntp: {
                        type: "object",
                        properties: {
                          host: { type: "string" },
                          source: { type: "string", enum: ["local", "fallback"] },
                          warning: { type: ["string", "null"] },
                        },
                      },
                      timezones: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            zone: { type: "string" },
                            nowIso: { type: "string", format: "date-time" },
                            unix: { type: "integer" },
                            offsetMinutes: { type: "integer" },
                            formatted: { type: "string" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/health": {
        get: {
          summary: "Health check",
          responses: {
            "200": {
              description: "Health status and Chrony tracking",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", enum: ["ok", "degraded"] },
                      nowIso: { type: "string", format: "date-time" },
                      uptimeMs: { type: "integer" },
                      uptimeSeconds: { type: "integer" },
                      startedAtIso: { type: "string", format: "date-time" },
                      ntp: {
                        type: "object",
                        properties: {
                          host: { type: "string" },
                          source: { type: "string", enum: ["local", "fallback"] },
                          warning: { type: ["string", "null"] },
                        },
                      },
                      chrony: {
                        type: "object",
                        properties: {
                          ok: { type: "boolean" },
                          tracking: { type: "string" },
                          error: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };

  return NextResponse.json(spec, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
