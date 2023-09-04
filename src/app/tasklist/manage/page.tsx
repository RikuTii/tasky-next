import { getServerSession } from "next-auth/next";
import styles from "@/page.module.css";
import { authOptions } from "@/lib/auth";
import TasksListing from "@/components/tasks/taskslisting";

export default async function Create() {
  const session = await getServerSession(authOptions);

  if (session) {
    return <TasksListing />;
  }
  return <h1 className="text-white">Access denied</h1>;
}

export async function getServerSideProps(context: any) {
  return {
    props: {
      session: await getServerSession(context.req, context.res, authOptions),
    },
  };
}
