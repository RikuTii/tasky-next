"use client";
import { Notifications } from "@mantine/notifications";
import { MantineProvider } from "@mantine/core";
import "@/globals.css";
import HeaderMenu from "@/components/layout/header";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import UserNotifications from "@/components/user-notifications";

const queryClient = new QueryClient();
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
      <QueryClientProvider client={queryClient}>
        <UserNotifications></UserNotifications>
        <Notifications />
        <HeaderMenu />
        {children}
      </QueryClientProvider>
    </MantineProvider>
  );
}
