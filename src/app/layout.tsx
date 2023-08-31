import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "./components/layout/header";
import NextAuthProvider from "./context/sessionprovider";

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
          <Header />
          {children}
        </NextAuthProvider>
      </body>
    </html>
  );
}
