"use client";
import { Notifications } from '@mantine/notifications';
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
      <Notifications />
      <HeaderMenu />
      {children}
    </MantineProvider>
  );
}
