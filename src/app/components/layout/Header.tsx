"use client";
import Link from "next/link";
import "../../styles/header.scss";
import "./../../globals.css";
import { useSession, signIn, signOut } from "next-auth/react";
const Header = () => {
  const { data: session, status } = useSession();

  /*if (status === "authenticated") {
    return <p>yes</p>;
  }*/

  return (
    <div
      className="d-flex justify-content-between"
      style={{ backgroundColor: "gray", height: 70 }}
    >
      <Link href="/">
        <div className="logo">Tasky</div>
      </Link>

      <div className="nav-bar">
        <Link href="/auth/register">
          <div className="nav-item">Manage tasklists</div>
        </Link>
        <Link href="/auth/register">
          <div className="nav-item">New tasklist</div>
        </Link>
        {status === "authenticated" && (
          <p className="text-white">{session.user?.email}</p>
        )}
        <Link href="/auth/register">
          <div className="nav-item">Register</div>
        </Link>
        {/* <Link href="/api/auth/signin">
          <div className="nav-item">Login</div>
        </Link> */}

        {status === "authenticated" && (
          <div
          className="nav-item c-pointer"
          onClick={(e) => {
            e.preventDefault();
            signOut();
          }}
        >
          Sign out
        </div>
        )}
         {status !== "authenticated" && (
             <Link href="/auth/login">

          <div className="nav-item">Sign in</div>

        </Link>
        )}

      </div>
    </div>
  );
};

export default Header;
