import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Minner fra Rotfest",
  description: "Bilder tatt fra Rotfest – Bekk sitt 25-års jubileum.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nb-no">
      <body>{children}</body>
    </html>
  );
}
