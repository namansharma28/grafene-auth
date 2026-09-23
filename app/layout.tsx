import type { Metadata } from "next";
import { Poppins, VT323 } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "@/components/providers/NextAuthProvider";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const vt323 = VT323({
  variable: "--font-vt323",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Grafene Auth | Unified Global Identity Platform",
  description: "Single sign-on service for Grafene ecosystem websites and applications.",
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
    <html lang="en" className={`${poppins.variable} ${vt323.variable}`}>
      <body className="antialiased bg-[#09090b] text-white selection:bg-[#FF4B33] selection:text-white min-h-screen">
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}
