import { getServerSession } from "next-auth/next";
import styles from "@/page.module.css";
import CreateTaskList from "@/components/tasks/create-tasklist";
import { authOptions } from "@/lib/auth";

export default async function Create({}) {
  return (
    <div>
      <CreateTaskList />
    </div>
  );
}
