import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UMM Paper Radar",
  description:
    "A bilingual research radar for unified multimodal models, visual tokens, image and video generation, interpretability, and world models.",
  other: {
    "codex-preview": "development",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
