import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Commit Confessional",
  description: "Turn hasty late-night git diffs into deadpan incident reports and clean pull requests.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FAFAF7] text-[#1C1B19] antialiased">
        {children}
      </body>
    </html>
  );
}
