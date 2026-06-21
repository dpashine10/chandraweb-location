import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chandra Hotel & Restaurant",
  description: "Freshly prepared dishes, thoughtful service, and a menu designed for easy browsing.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
