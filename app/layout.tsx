import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["latin", "vietnamese"],
  variable: "--font-be-vietnam-pro",
});

export const metadata: Metadata = {
  title: {
    default: 'Betonamu — Kho tài liệu tiếng Nhật miễn phí',
    template: '%s | Betonamu',
  },
  description:
    'Nền tảng học tiếng Nhật với kho tài liệu miễn phí: Minna no Nihongo, Somatome, Mimikara Oboeru và đề thi JLPT các năm.',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    siteName: 'Betonamu',
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${beVietnamPro.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" style={{ fontFamily: 'var(--font-be-vietnam-pro), sans-serif' }} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
