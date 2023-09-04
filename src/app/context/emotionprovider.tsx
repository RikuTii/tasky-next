"use client";
import { useGluedEmotionCache } from "@/lib/emotionjsglue";
import { CacheProvider } from "@emotion/react";
import { MantineProvider } from "@mantine/core";
import "@/globals.css";
import HeaderMenu from "@/components/layout/header";

export default function EmotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{
        colorScheme: "dark",
      }}
    >
      <HeaderMenu />
      {children}
    </MantineProvider>
  );
}
