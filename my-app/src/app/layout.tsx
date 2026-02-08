import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { StoreProvider } from "./providers/StoreProvider";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

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
      <body className="antialiased">
        <StoreProvider>
          <AppShell footer={<Footer />} header={<Header />}>
            {children}
          </AppShell>
        </StoreProvider>
      </body>
    </html>
  );
}
