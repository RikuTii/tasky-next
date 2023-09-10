"use client";
import { Notifications, notifications } from "@mantine/notifications";
import { MantineProvider, useEmotionCache } from "@mantine/core";
import "@/globals.css";
import HeaderMenu from "@/components/layout/header";
import { useServerInsertedHTML } from "next/navigation";
import { CacheProvider } from "@emotion/react";
import { getMessaging, onMessage } from "firebase/messaging";
import { useEffect } from "react";
import fireBaseApp from "./firebase";

export default function EmotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const cache = useEmotionCache();
  cache.compat = true;

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const messaging = getMessaging(fireBaseApp);
      const unsubscribe = onMessage(messaging, (payload) => {
        notifications.show({
          title: payload.notification?.title,
          message: payload.notification?.body,
        });
      });
      return () => {
        unsubscribe();
      };
    }
  }, []);

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
        <Notifications />
        <HeaderMenu />
        {children}
      </MantineProvider>
    </CacheProvider>
  );
}
