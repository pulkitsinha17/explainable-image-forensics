import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PIXENTRA — See Beyond the Pixels | Explainable Image Forensics",
  description:
    "PIXENTRA is an AI-powered digital image forensics platform that analyzes images for signs of manipulation, localizes suspicious regions, and provides understandable forensic evidence explaining why an image may be manipulated.",
  keywords: [
    "image forensics",
    "forgery detection",
    "explainable AI",
    "image manipulation",
    "digital forensics",
    "heatmap",
    "multi-evidence",
  ],
  openGraph: {
    title: "PIXENTRA — See Beyond the Pixels",
    description:
      "AI-powered explainable multi-evidence image forgery detection and localization.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-gray-900 overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
