import type { Metadata } from "next";
import { Geist, Geist_Mono, League_Gothic, Inter, Bebas_Neue } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import Script from "next/script";
import { SecurityProvider } from "@/components/security-provider";
import { ThemeProvider } from "@/components/theme-provider";

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

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pff24.pl"),
  title: "1 Liga Działdowska - Oficjalna Strona",
  description: "Oficjalna strona 1 Ligi Działdowskiej",
  icons: {
    icon: "https://i.ibb.co/Rkz8MRSy/IMG-4837.png",
    apple: "https://i.ibb.co/Rkz8MRSy/IMG-4837.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} ${leagueGothic.variable} ${inter.variable} ${bebasNeue.variable}`}>
      <head>
        <Script
          crossOrigin="anonymous"
          src="//unpkg.com/same-runtime/dist/index.global.js"
        />
      </head>
      <body suppressHydrationWarning className="antialiased min-h-screen font-bebas">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SecurityProvider>
            <ClientBody>{children}</ClientBody>
          </SecurityProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
