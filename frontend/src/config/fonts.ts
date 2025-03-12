import localFont from "next/font/local";

// You can also consider using Google Fonts like:
// import { Inter, DM_Sans } from "next/font/google";

export const geistSans = localFont({
  src: "../pages/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const geistMono = localFont({
  src: "../pages/fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// Common className to use across pages
export const fontClassName = `${geistSans.variable} ${geistMono.variable} font-[family-name:var(--font-geist-sans)]`;
