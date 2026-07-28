import type { Metadata, Viewport } from "next";
import { AppStateProvider } from "@/lib/store";
import "./globals.css";

export const metadata: Metadata = {
  title: "こいびとアプリ",
  description: "自分だけの恋人と話せるアプリ",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ff6f9c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="h-full antialiased">
        <AppStateProvider>
          {/* スマホ想定。PCでは中央に寄せて縦長の画面として見せる */}
          <div className="mx-auto flex h-full w-full max-w-[480px] flex-col overflow-hidden bg-black shadow-2xl">
            {children}
          </div>
        </AppStateProvider>
      </body>
    </html>
  );
}
