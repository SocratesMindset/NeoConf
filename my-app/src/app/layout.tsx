import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { StoreProvider } from "./providers/StoreProvider";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Lora, Manrope } from "next/font/google";

const bodyFont = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

const displayFont = Lora({
  subsets: ["latin", "cyrillic"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

export const metadata = {
  title: "NeoConf",
  description: "Базовый шаблон проекта на Next.js с MobX",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body
        className={`${bodyFont.variable} ${displayFont.variable} antialiased`}
      >
        <StoreProvider>
          <AppShell footer={<Footer />} header={<Header />}>
            {children}
          </AppShell>
        </StoreProvider>
      </body>
    </html>
  );
}
