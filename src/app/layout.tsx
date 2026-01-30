import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Voice Intelligence",
  description: "AI-powered voice recording, transcription, and enrichment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
