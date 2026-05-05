import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dashboard Empresarial",
  description: "Panel ejecutivo de ventas sincronizado por n8n desde Google Sheets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={sora.variable}>
      <body className="min-h-screen bg-(--background) text-(--foreground) antialiased">
        {children}
      </body>
    </html>
  );
}

