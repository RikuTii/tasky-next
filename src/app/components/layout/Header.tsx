"use client";
import Link from "next/link";
import {
  Group,
  Header,
  createStyles,
  rem,
  MediaQuery,
  CSSObject,
  Burger,
  Box,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";

import "../../styles/header.scss";
import "./../../globals.css";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { useMediaQuery, useViewportSize } from "@mantine/hooks";
const HEADER_HEIGHT = rem(60);

const useStyles = createStyles((theme) => ({
  inner: {
    height: HEADER_HEIGHT,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  links: {
    [theme.fn.smallerThan("sm")]: {
      display: "none",
    },
  },

  burger: {
    [theme.fn.largerThan("sm")]: {
      display: "none",
    },
  },

  link: {
    display: "block",
    lineHeight: 1,
    padding: `${rem(8)} ${rem(12)}`,
    borderRadius: theme.radius.sm,
    textDecoration: "none",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[0]
        : theme.colors.gray[7],
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,

    [theme.fn.smallerThan("sm")]: {
      width: "100%",
    },

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    },
  },

  linkLabel: {
    marginRight: rem(5),
  },
}));
const hideElement: CSSObject = {
  display: "none",
};

const HeaderMenu = () => {
  const { classes } = useStyles();
  const { data: session, status } = useSession();
  const [showMenu, setShowMenu] = useState(false);
  const theme = useMantineTheme();
  const { height, width } = useViewportSize();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm}`);

  if (!isMobile) {
    if (showMenu) {
      setShowMenu(false);
    }
  }

  const signUserOut = async () => {
    const result = await signOut({
      redirect: true,
      callbackUrl: "/",
    });
  };

  const renderLinks = () => {
    return (
      <MediaQuery smallerThan="sm" styles={{ display: "inline-block" }}>
        <Box sx={{ display: "flex" }} onClick={() => setShowMenu(false)}>
          <Link href="/tasklist/manage">
            <div className={classes.link}>Manage tasklists</div>
          </Link>
          <Link href="/tasklist/create">
            <div className={classes.link}>New tasklist</div>
          </Link>
          {status === "authenticated" && (
            <UnstyledButton className={classes.link}>
              <Link href="/profile">{session.user?.email}</Link>
            </UnstyledButton>
          )}
          <Link href="/auth/register">
            <div className={classes.link}>Register</div>
          </Link>
          {status === "authenticated" && (
            <UnstyledButton
              className={classes.link}
              onClick={(e) => {
                e.preventDefault();
                signUserOut();
              }}
            >
              Sign out
            </UnstyledButton>
          )}
          {status !== "authenticated" && (
            <Link href="/auth/login">
              <div className={classes.link}>Sign in</div>
            </Link>
          )}
        </Box>
      </MediaQuery>
    );
  };

  return (
    <Header height={HEADER_HEIGHT} mb={70}>
      <Group position="apart">
        <Link href="/">
          <div className="logo">Tasky</div>
        </Link>

        <MediaQuery smallerThan="sm" styles={hideElement}>
          <div>
            <div className="nav-bar">{renderLinks()}</div>
          </div>
        </MediaQuery>
        <MediaQuery largerThan="sm" styles={{ display: "none" }}>
          <div>
            <Burger opened={showMenu} onClick={(e) => setShowMenu(!showMenu)} />
          </div>
        </MediaQuery>

        {showMenu && (
          <Box sx={{ position: "absolute", right: 5, top: 55 }}>
            <Box
              sx={(theme) => ({
                background: theme.colors.dark[5],
                display: "flex",
                flexDirection: "column",
                borderRadius: 6,
              })}
            >
              {renderLinks()}
            </Box>
          </Box>
        )}
      </Group>
    </Header>
  );
};

export default HeaderMenu;
