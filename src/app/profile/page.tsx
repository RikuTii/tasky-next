import { getServerSession } from "next-auth/next";
import styles from "@/page.module.css";
import Profile from "@/components/profile";
import { authOptions } from "@/lib/auth";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    return (
      <div>
        <Profile />
      </div>
    );
  }
  return <h1 className="text-white">Access denied</h1>;
}
