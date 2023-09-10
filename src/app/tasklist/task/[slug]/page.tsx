import { getServerSession } from "next-auth/next";
import styles from "@/page.module.css";
import { authOptions } from "@/lib/auth";
import ManageTask from "@/components/tasks/manage-task";
import { Flex } from "@mantine/core";

export default async function Task({ params }: { params: { slug: string } }) {
  return <ManageTask task={null} taskId={params.slug}></ManageTask>;
}
