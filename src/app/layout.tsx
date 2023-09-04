
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import NextAuthProvider from "./context/sessionprovider";
import EmotionProvider from "./context/emotionprovider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tasky",
  description: "Task managing web-application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider>
          <EmotionProvider>
            {children}
          </EmotionProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
