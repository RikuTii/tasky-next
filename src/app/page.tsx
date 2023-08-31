"use client"
import { useSession } from "next-auth/react";
import "./globals.css";
import styles from './page.module.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoffee } from "@fortawesome/free-solid-svg-icons";


export default function Home() {

  const { data: session, status } = useSession()

  return (
    <main className={styles.main}>
      <div>
        <p>
          Get started by editing&nbsp;
          <code>src/app/page.tsx</code>
        </p>
      </div>
    </main>
  )
}
