"use client";
import { useEffect, useState } from "react";
import { authFetch } from "../helpers/auth-fetch";

const Dashboard = () => {
  async function submitLogin() {
    const data = await fetch("api/fetch/SecureData");
    const json = await data.json();
    console.log(json);
  }

  useEffect(() => {
    submitLogin();
  }, []);

  return (
    <main>
      <div>
        <p>
          Get started by editing&nbsp;
          <code>src/app/page.tsx</code>
        </p>
      </div>
    </main>
  );
};

export default Dashboard;
