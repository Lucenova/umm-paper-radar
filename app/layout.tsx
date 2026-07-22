import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UMM 论文雷达",
  description:
    "统一多模态模型、视觉 Token、Diffusion/Flow、可解释性与世界模型研究雷达。",
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
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
