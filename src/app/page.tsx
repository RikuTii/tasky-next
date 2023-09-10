"use client";
import { useSession } from "next-auth/react";
import "./globals.css";
import styles from "./page.module.css";
import { Loader, Center, Flex, Container } from "@mantine/core";
import TasksListing from "./components/tasks/tasks-overview";
import TasksUpcoming from "./components/tasks/task-upcoming";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  if (status === "authenticated") {
    return (
      <Center>
        <Container fluid>
          <TasksUpcoming />
          <TasksListing />
        </Container>
      </Center>
    );
  }

  return (
    <main className={styles.main}>
      <div>
        <p>
          Sign in or register to start creating tasks today!
        </p>
      </div>
    </main>
  );
}
