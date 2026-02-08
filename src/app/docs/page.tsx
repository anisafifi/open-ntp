"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function DocsPage() {
  return (
    <div className="app-shell">
      <main className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col px-6 pb-20 pt-16 sm:px-10">
        <div className="glass-panel card-glow rounded-3xl p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold text-foreground">API Docs</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              OpenNTP endpoints and response schemas.
            </p>
          </div>
          <SwaggerUI url="/api/openapi" docExpansion="list" />
        </div>
      </main>
    </div>
  );
}
