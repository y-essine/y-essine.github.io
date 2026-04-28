import type { Metadata } from "next";
import "./fonts.css";
import "./globals.css";
import MorphingObject from "@/components/morphing-object";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "My portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body className="antialiased">
        <MorphingObject />
        {children}
      </body>
    </html>
  );
}
