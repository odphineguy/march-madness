import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tony's Madness 2026",
  description: "March Madness Bracket Tournament - Make Your Picks!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="texture-overlay" />
        <div className="topo-bg">
          <div className="topo-lines" />
        </div>
        {children}
      </body>
    </html>
  );
}
