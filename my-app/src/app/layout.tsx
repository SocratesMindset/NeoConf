import { QueryProvider } from "./providers/QueryProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
