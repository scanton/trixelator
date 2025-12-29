import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trixelator",
  description: "Generate triangle mosaics for the web and desktop",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
