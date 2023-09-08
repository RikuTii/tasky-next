import { getServerSession } from "next-auth/next";
import styles from "@/page.module.css";
import { authOptions } from "@/lib/auth";
import ManageTask from "@/components/tasks/manage-task";
import { Flex } from "@mantine/core";

export default async function Task({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);

  if (session) {
    return <ManageTask task={null} taskId={params.slug}></ManageTask>;
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
