"use client";
import { Notifications, notifications } from "@mantine/notifications";
import {
  Grid,
  MantineProvider,
  MediaQuery,
  useEmotionCache,
  useMantineTheme,
} from "@mantine/core";
import "@/globals.css";
import HeaderMenu from "@/components/layout/header";
import { useServerInsertedHTML } from "next/navigation";
import { CacheProvider } from "@emotion/react";
import { getMessaging, onMessage } from "firebase/messaging";
import { useEffect } from "react";
import fireBaseApp from "./firebase";
import Sidebar from "@/components/layout/sidebar";
import { useMediaQuery } from "@mantine/hooks";
import { useSession } from "next-auth/react";

export default function EmotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const cache = useEmotionCache();
  cache.compat = true;
  const { data: session, status } = useSession();

  const theme = useMantineTheme();
  const hideSidebar = useMediaQuery(`(max-width: ${theme.breakpoints.lg}`);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const messaging = getMessaging(fireBaseApp);
      const unsubscribe = onMessage(messaging, (payload) => {
        notifications.show({
          title: payload.data?.title,
          message: payload.data?.body,
          autoClose: false,
        });
      });
      return () => {
        unsubscribe();
      };
    }
  }, []);

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

        {hideSidebar && status === "authenticated" && <div>{children}</div>}
        {status !== "authenticated" && <div>{children}</div>}

        {status === "authenticated" && (
          <MediaQuery smallerThan={"lg"} styles={{ display: "none" }}>
            <Grid m={0} grow>
              <Grid.Col span={10}>{children}</Grid.Col>
              <Grid.Col span={1}>
                <Sidebar />
              </Grid.Col>
            </Grid>
          </MediaQuery>
        )}
      </MantineProvider>
    </CacheProvider>
  );
}
