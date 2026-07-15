import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FutureLens",
  description: "Three futures for every decision.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body min-h-screen bg-paper text-ink">{children}</body>
    </html>
  );
}
