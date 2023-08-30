"use client";
import Link from "next/link";
import "../../styles/header.scss";
import "./../../globals.css";
import Header from "./Header";
import { useState } from "react";
const AuthHeader = () => {
  const [loginStatus, setLoginStatus] = useState(false);

  const logOut = () => {
    console.log("removed");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
    setLoginStatus(false);
  };

  if (!sessionStorage.getItem("access_token")) {
    return <Header></Header>;
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
        <Link href="/auth/register">
          <div className="nav-item">New tasklist</div>
        </Link>

        <div className="nav-item" onClick={(e) => logOut()}>
          Logout
        </div>
      </div>
    </div>
  );
};

export default AuthHeader;
