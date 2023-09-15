import {
  Avatar,
  Box,
  Container,
  Divider,
  Flex,
  Text,
  rem,
  createStyles,
} from "@mantine/core";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const useStyles = createStyles((theme) => ({
  userContainer: {
    display: "block",
    lineHeight: 1,
    padding: `${rem(12)} ${rem(12)}`,
    borderRadius: theme.radius.sm,
    textDecoration: "none",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[0]
        : theme.colors.gray[7],
    fontSize: theme.fontSizes.md,
    fontWeight: 500,
    cursor: "pointer",

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    },
  },
  mainContainer: {
    width: "100%",
    height: "calc(100vh - 6rem)",
    borderLeftWidth: "1px",
    borderLeftColor: theme.colors.dark[6],
    borderLeftStyle: "solid",
  },
}));


const Sidebar = () => {
  const { classes } = useStyles();
  const router = useRouter();
  const { data: session, status } = useSession();

  if(status !== "authenticated") {
    return <></>
  }

  return (
    <Container m={0} p={0} className={classes.mainContainer}>
      <Flex direction={"column"} justify={"flex-end"} align={"center"} h="100%">
        <Box>
          <Flex
            direction={"row"}
            align={"center"}
            justify={"center"}
            gap="md"
            className={classes.userContainer}
            onClick={() => router.push("/profile")}
          >
            <Avatar color="cyan" radius="xl">
              {session?.user?.name?.substring(0, 1) ?? ":)"}
            </Avatar>
            <Flex direction={"column"}>
              <Text>{session?.user?.name}</Text>
              <Text fw={400}>{session?.user?.email}</Text>
            </Flex>
          </Flex>
        </Box>
      </Flex>
    </Container>
  );
};

export default Sidebar;
