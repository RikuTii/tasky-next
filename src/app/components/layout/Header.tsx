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
} from "@mantine/core";

import "../../styles/header.scss";
import "./../../globals.css";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
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

  const signUserOut = async () => {
    const result = await signOut({
      redirect: true,
      callbackUrl: "/",
    });
  };

  return (
    <Header height={HEADER_HEIGHT} mb={70}>
      <Group position="apart">
        <Link href="/">
          <div className="logo">Tasky</div>
        </Link>

        <MediaQuery smallerThan="sm" styles={hideElement}>
          <div>
            <div className="nav-bar">
              <Link href="/tasklist/manage">
                <div className={classes.link}>Manage tasklists</div>
              </Link>
              <Link href="/tasklist/create">
                <div className={classes.link}>New tasklist</div>
              </Link>
              {status === "authenticated" && (
                <p className={classes.link}>{session.user?.email}</p>
              )}
              <Link href="/auth/register">
                <div className={classes.link}>Register</div>
              </Link>
              {status === "authenticated" && (
                <div
                  className={classes.link}
                  onClick={(e) => {
                    e.preventDefault();
                    signUserOut();
                  }}
                >
                  Sign out
                </div>
              )}
              {status !== "authenticated" && (
                <Link href="/auth/login">
                  <div className={classes.link}>Sign in</div>
                </Link>
              )}
            </div>
          </div>
        </MediaQuery>
        <MediaQuery largerThan="sm" styles={{ display: "none" }}>
          <div>
            <Burger opened={showMenu} onClick={(e) => setShowMenu(!showMenu)} />
          </div>
        </MediaQuery>

        {showMenu && (
          <Box sx={{ position: "absolute", right: 25, top: 55 }}>
            <Box
              sx={(theme) => ({
                background: theme.colors.dark[5],
                display: "flex",
                flexDirection: "column",
                borderRadius: 6,
              })}
            >
              <Link href="/tasklist/manage">
                <div className={classes.link}>Manage tasklists</div>
              </Link>
              <Link href="/tasklist/create">
                <div className={classes.link}>New tasklist</div>
              </Link>
              {status === "authenticated" && (
                <p className={classes.link}>{session.user?.email}</p>
              )}
              <Link href="/auth/register">
                <div className={classes.link}>Register</div>
              </Link>
              {status === "authenticated" && (
                <div
                  className={classes.link}
                  onClick={(e) => {
                    e.preventDefault();
                    signUserOut();
                  }}
                >
                  Sign out
                </div>
              )}
              {status !== "authenticated" && (
                <Link href="/auth/login">
                  <div className={classes.link}>Sign in</div>
                </Link>
              )}
            </Box>
          </Box>
        )}
      </Group>
    </Header>
  );
};

export default HeaderMenu;
