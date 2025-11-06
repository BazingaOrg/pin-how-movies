import type { Metadata } from "next";
import Image from "next/image";
import localFont from "next/font/local";
import "./globals.css";
import "@/styles/components.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Pin How Movies",
  description: "Pin How Movies delivers a cinematic search experience inspired by Meituan Pin Hao Fan and powered by TMDB.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative min-h-screen`}
      >
        <div className="background-container" aria-hidden="true">
          <div className="stars" />
          <div className="twinkling" />
          <div className="clouds" />
          <Image
            src="/background/moon2.png"
            alt="Moon illustration"
            width={360}
            height={360}
            priority
          />
        </div>
        <div className="relative z-10 flex min-h-screen flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
