import type { Metadata } from "next";
import { Sora, JetBrains_Mono, Share_Tech_Mono } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const shareTechMono = Share_Tech_Mono({
  variable: "--font-digital",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OpenNTP",
  description:
    "OpenNTP ships a ready-to-run Chrony container, a configurable UI, and a time API.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${sora.variable} ${jetBrainsMono.variable} ${shareTechMono.variable} antialiased font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
