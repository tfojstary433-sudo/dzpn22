import type { Metadata } from "next";
import { Geist, Geist_Mono, League_Gothic, Inter } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import Script from "next/script";
import { SecurityProvider } from "@/components/security-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const leagueGothic = League_Gothic({
  variable: "--font-league-gothic",
  subsets: ["latin"],
  weight: "400",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pff24.pl"),
  title: "PFF Roblox - Oficjalna Strona Federacji",
  description: "Oficjalna strona Federacji PFF Roblox",
  icons: {
    icon: "https://i.ibb.co/BHdnmcMj/LOGO-PFF.png",
    apple: "https://i.ibb.co/BHdnmcMj/LOGO-PFF.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} ${leagueGothic.variable} ${inter.variable}`}>
      <head>
        <Script
          crossOrigin="anonymous"
          src="//unpkg.com/same-runtime/dist/index.global.js"
        />
      </head>
      <body suppressHydrationWarning className="antialiased min-h-screen font-inter">
        <div className="bg-red-600 text-white text-center py-2 px-4 font-black uppercase tracking-widest text-xs sticky top-0 z-[200]">
          Sklep podczas prac technicznych
        </div>
        <SecurityProvider>
          <ClientBody>{children}</ClientBody>
        </SecurityProvider>
      </body>
    </html>
  );
}
