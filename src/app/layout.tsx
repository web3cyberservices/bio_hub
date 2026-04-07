import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PRO Себя | Ваш персональный ИИ нутрициолог',
  description: 'Индивидуальные рекомендации по питанию, образу жизни и добавкам на основе ваших данных и анализов.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Outfit:wght@500;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
