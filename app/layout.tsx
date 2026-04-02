import type { Metadata } from "next";
import { Poppins, Sora } from "next/font/google";
import { Providers } from "@/app/providers";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Khapree Admin Dashboard",
  description: "GeistGlow admin panel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${sora.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans text-app-body">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
