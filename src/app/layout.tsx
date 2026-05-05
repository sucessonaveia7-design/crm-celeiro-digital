import type { Metadata } from "next";
import { Geist, Geist_Mono, Dancing_Script, Saira_Stencil_One } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
});

const sairaStencil = Saira_Stencil_One({
  weight: "400",
  variable: "--font-saira-stencil",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Celeiro Digital",
  description: "SaaS CRM e Automação para WhatsApp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dancingScript.variable} ${sairaStencil.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
