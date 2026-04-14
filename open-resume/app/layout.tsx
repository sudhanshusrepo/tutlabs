import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = localFont({
  src: [
    { path: "./fonts/GeistVF.woff", weight: "100 900", style: "normal" },
  ],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "OpenResume Builder",
  description: "Free Open Source Resume Builder",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body className="antialiased text-foreground bg-background">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
