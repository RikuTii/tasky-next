import { getServerSession } from "next-auth/next";
import styles from "@/page.module.css";
import CreateTaskList from "@/components/tasks/create-tasklist";
import { authOptions } from "@/lib/auth";

export default async function Create() {
  const session = await getServerSession(authOptions);

  if (session) {
    return (
      <main className={styles.main}>
        <div>
          <CreateTaskList />
        </div>
      </main>
    );
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
