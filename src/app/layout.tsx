import type { Metadata, Viewport } from "next";
import { Fredoka, Geist_Mono } from "next/font/google";
import "./globals.css";

const display = Fredoka({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tamagotchi Web",
  description:
    "Tamagotchi Web — o teu tamagotchi no telemóvel (PWA mobile-first).",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Tamagotchi Web",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/tamagotchi.png", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/icons/tamagotchi.png",
    shortcut: "/icons/tamagotchi.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#ff8fb8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" className={`${display.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full font-[family-name:var(--font-display)] antialiased">
        {children}
      </body>
    </html>
  );
}
