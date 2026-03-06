import type { Metadata } from "next";
import { Ubuntu, Ubuntu_Mono } from "next/font/google";
import "./globals.css";

const ubuntu = Ubuntu({
  variable: "--font-ubuntu",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const ubuntuMono = Ubuntu_Mono({
  variable: "--font-ubuntu-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Bhargava A",
  description: "A portfolio of Bhargava A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          #boot-fallback {
            position: fixed;
            inset: 0;
            background: black;
            z-index: 99999;
          }
        ` }} />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preload" as="image" href="/Bhargava.png" fetchPriority="high" />
      </head>
      <body
        className={`${ubuntu.variable} ${ubuntuMono.variable} antialiased select-none`}
        suppressHydrationWarning
      >
        <div id="boot-fallback"></div>
        {children}
      </body>
    </html>
  );
}
