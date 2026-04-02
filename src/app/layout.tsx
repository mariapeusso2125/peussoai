import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Iluminar Peusso | Asistente de Productos",
  description: "Asistente AI para consulta de productos de iluminación - Iluminar Peusso",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
