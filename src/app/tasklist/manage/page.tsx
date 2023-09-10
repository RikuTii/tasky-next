import { getServerSession } from "next-auth/next";
import styles from "@/page.module.css";
import { authOptions } from "@/lib/auth";
import TasksListing from "@/components/tasks/tasks-overview";
import TaskLists from "@/components/tasks/manage-tasklists";

export default async function Create() {
  return <div style={{marginLeft: 150,marginRight: 150}}> <TaskLists /> </div>;
}
