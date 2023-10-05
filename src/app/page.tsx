"use client";
import { useSession } from "next-auth/react";
import "./globals.css";
import styles from "./page.module.css";
import Autoplay from "embla-carousel-autoplay";
import {
  Loader,
  Center,
  Flex,
  Container,
  Box,
  BackgroundImage,
  Text,
  Title,
  Image,
  Button,
  rem,
  List,
  useMantineTheme,
} from "@mantine/core";
import TasksListing from "./components/tasks/tasks-overview";
import TasksUpcoming from "./components/tasks/task-upcoming";
import { Carousel } from "@mantine/carousel";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { useMediaQuery } from "@mantine/hooks";
import TaskActive from "./components/tasks/task-active";

export default function Home() {
  const { data: session, status } = useSession();
  const autoplay = useRef(Autoplay({ delay: 5000 }));
  const router = useRouter();
  const theme = useMantineTheme();

  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm}`);

  if (status === "loading") {
    return (
      <Center w="100vw" h="calc(100vh - 20rem)">
        <Loader />
      </Center>
    );
  }

  if (status === "authenticated") {
    return (
      <>
        <Center>
          <Container fluid>
            <TasksUpcoming />
            <TasksListing />
          </Container>
        </Center>
      </>
    );
  }

  return (
    <Center mx="auto">
      <Container size="lg" fluid w={1000} h="calc(100vh - rem(20))">
        <Carousel
          mx="auto"
          ml="auto"
          mr="auto"
          withIndicators
          mah={400}
          plugins={[autoplay.current]}
        >
          <Carousel.Slide>
            <Flex
              align={"center"}
              justify={"center"}
              sx={{ backgroundColor: "rgba(0,0,0,0.2)" }}
              h={400}
              p={50}
            >
              <Image src={`/info/1${isMobile ? "_sm" : ""}.png`}></Image>
            </Flex>
          </Carousel.Slide>
          <Carousel.Slide>
            <Flex
              align={"center"}
              justify={"center"}
              sx={{ backgroundColor: "rgba(0,0,0,0.2)" }}
              p={50}
              h={400}
            >
              <Image
                src={`/info/2${isMobile ? "_sm" : ""}.png`}
                height="350px"
                fit="scale-down"
              ></Image>
            </Flex>
          </Carousel.Slide>
          <Carousel.Slide>
            <Flex
              align={"center"}
              justify={"center"}
              sx={{ backgroundColor: "rgba(0,0,0,0.2)" }}
              h={400}
              p={50}
            >
              <Image
                src={`/info/3${isMobile ? "_sm" : ""}.png`}
                fit="scale-down"
              ></Image>
            </Flex>
          </Carousel.Slide>
          <Carousel.Slide>
            <Flex
              align={"center"}
              justify={"center"}
              sx={{ backgroundColor: "rgba(0,0,0,0.2)" }}
              h={400}
              p={50}
            >
              <Image src={`/info/4${isMobile ? "_sm" : ""}.png`}></Image>
            </Flex>
          </Carousel.Slide>
        </Carousel>
        <Flex
          align={"center"}
          justify={"center"}
          direction={"column"}
          mt={rem(30)}
        >
          <Title mb={rem(8)}>Start being more productive today!</Title>
          <Container
            w="100%"
            fluid
            p={rem(15)}
            pr={rem(25)}
            sx={{
              background: "rgba(0,0,0,0.2)",
            }}
          >
            <Text fz="lg" fw={700}>
              It has never been easier to manage your tasks.
            </Text>
            <List>
              <List.Item fz="lg">
                Tasky can be used as a simple grocery list
              </List.Item>
              <List.Item fz="lg">
                It can be used as extensive time tracking tool for tasks
              </List.Item>
              <List.Item fz="lg">
                Tasks can be rearranged with ease or removed with a swipe of a
                finger
              </List.Item>
              <List.Item fz="lg">
                It can also be used to send you reminders about your scheduled
                tasks!
              </List.Item>
              <List.Item fz="lg">Mobile friendly</List.Item>
            </List>
          </Container>
        </Flex>
        <Center mx="auto" mt={rem(30)} mb={rem(30)}>
          <Button
            onClick={() => router.push("auth/register")}
            variant="gradient"
            size="lg"
          >
            Get started
          </Button>
        </Center>
      </Container>
    </Center>
  );
}
