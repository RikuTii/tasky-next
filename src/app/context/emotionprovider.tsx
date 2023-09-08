"use client";
import { Notifications } from "@mantine/notifications";
import { MantineProvider, useEmotionCache } from "@mantine/core";
import "@/globals.css";
import HeaderMenu from "@/components/layout/header";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import UserNotifications from "@/components/user-notifications";
import { useServerInsertedHTML } from "next/navigation";
import { CacheProvider } from "@emotion/react";

const queryClient = new QueryClient();
export default function EmotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const cache = useEmotionCache();
  cache.compat = true;

  const toggleColorScheme = () => {
    document.body.style.color = "var(--mantine-color-black)";
  };

  toggleColorScheme();

  useServerInsertedHTML(() => (
    <style
      data-emotion={`${cache.key} ${Object.keys(cache.inserted).join(" ")}`}
      dangerouslySetInnerHTML={{
        __html: Object.values(cache.inserted).join(" "),
      }}
    />
  ));

  return (
    <CacheProvider value={cache}>
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          colorScheme: "dark",
        }}
      >
        <QueryClientProvider client={queryClient}>
          <UserNotifications></UserNotifications>
          <Notifications />
          <HeaderMenu />
          {children}
        </QueryClientProvider>
      </MantineProvider>
    </CacheProvider>
  );
}
