import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Second Circle — Local second-hand marketplace",
  description: "Discover and sell quality pre-owned items near you.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
