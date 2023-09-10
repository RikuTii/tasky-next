import { getServerSession } from "next-auth/next";
import styles from "@/page.module.css";
import Profile from "@/components/profile";
import { authOptions } from "@/lib/auth";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    return (
      <main className={styles.main}>
        <div>
          <Profile />
        </div>
      </main>
    );
  }
  return <h1 className="text-white">Access denied</h1>;
}

