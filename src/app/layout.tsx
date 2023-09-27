import type { Metadata } from "next";
import { Inter } from "next/font/google";
import NextAuthProvider from "./context/sessionprovider";
import EmotionProvider from "./context/emotionprovider";
import Head from "next/head";

const inter = Inter({ subsets: ["latin"] });

const APP_NAME = "Tasky";
const APP_DEFAULT_TITLE = "Tasky";
const APP_TITLE_TEMPLATE = "%s - Tasky";
const APP_DESCRIPTION = "Task managing application";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  themeColor: "#25262B",
  viewport: {
    width: "device-width",
    initialScale: 1.0,
    maximumScale: 1.0
  },
  colorScheme: "dark",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_DEFAULT_TITLE,
     startupImage: "/icons/logo-512.png",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    images: "/icons/logo-512.png",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    images: "/icons/logo-512.png",
    description: APP_DESCRIPTION,
  },
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
          <EmotionProvider>{children}</EmotionProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
