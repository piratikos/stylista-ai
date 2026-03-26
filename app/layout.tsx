import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dr.Style — Ντύσου Ψηφιακά. Αγόρασε Πραγματικά.",
  description:
    "Δοκίμασε ρούχα online με τεχνητή νοημοσύνη. Virtual try-on platform για Ελλάδα.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="el">
      <body className={`${cormorant.variable} ${outfit.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
