"use client";
import Link from "next/link";
import "../../styles/header.scss";
import "./../../globals.css";
import { useSession, signIn, signOut } from "next-auth/react";
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'


library.add(fas,far)


const Header = () => {
  const { data: session, status } = useSession();

  const signUserOut = async () => {
    const result = await signOut({
      redirect: true,
      callbackUrl: "/"
    });
  }

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
        <Link href="/tasklist/create">
          <div className="nav-item">New tasklist</div>
        </Link>
        {status === "authenticated" && (
          <p className="text-white">{session.user?.email}</p>
        )}
        <Link href="/auth/register">
          <div className="nav-item">Register</div>
        </Link>
        {status === "authenticated" && (
          <div
            className="nav-item"
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
            <div className="nav-item">Sign in</div>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Header;
