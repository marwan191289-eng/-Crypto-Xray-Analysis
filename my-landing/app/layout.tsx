import type { Metadata, Viewport } from "next";

import "./globals.css";

const siteUrl = new URL("https://tradexray.com");

const title = "TradeXray — Institutional AI Market Intelligence";
const description =
  "Forensic-grade AI trading terminal combining neural forecasting, whale analytics, and real-time liquidity mapping.";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title,
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: "TradeXray",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/twitter-image"],
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-slate-100 antialiased">{children}</body>
    </html>
  );
}
