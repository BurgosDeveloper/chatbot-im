import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Catálogo Exclusivo",
  description: "Catálogo móvil interactivo con pedidos directos a WhatsApp.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#f0f4f8",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#f0f4f8] text-slate-900 selection:bg-blue-500 selection:text-white antialiased">
        <main className="max-w-md mx-auto min-h-screen flex flex-col relative pb-28">
          {children}
        </main>
      </body>
    </html>
  );
}
