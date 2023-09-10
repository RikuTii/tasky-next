import { utcToLocalTime } from "@/helpers/timedateformat";
import { Task } from "@/types/tasks";
import {
  Flex,
  Text,
  Card,
  Badge,
  Group,
  ScrollArea,
  Container,
  Skeleton,
} from "@mantine/core";
import Link from "next/link";
import { useEffect, useState } from "react";

const TasksUpcoming = (props: {}) => {
  const [upcoming, setUpcoming] = useState<Array<Task> | null>([]);
  const [loading, setLoading] = useState(true);
  const loadUpcomingTasks = async () => {
    const response = await fetch("/api/fetch/tasklist/GetUpcomingTasks/");

    if (!response.ok) {
      return;
    }

    const data = await response.json();
    setUpcoming(data);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    loadUpcomingTasks();
  }, []);

  return (
    <Skeleton visible={loading}>
      <ScrollArea w="100%" mih={150}>
        <Flex mt={8} mb={8} gap={"lg"} direction={"row"} w={450} pb={8}>
          {upcoming?.map((task: Task) => {
            return (
              <Link href={`tasklist/task/${task.id}`} key={task.id}>
                <Card shadow="sm" padding="lg" radius="md" withBorder miw={300}>
                  <Group position="apart" mt="md" mb="xs">
                    <Text weight={500}>{task.title}</Text>
                    <Badge color="pink" variant="light">
                      UPCOMING
                    </Badge>
                  </Group>
                  <Text size="sm" color="dimmed">
                    {utcToLocalTime(task.scheduleDate)}
                  </Text>
                </Card>
              </Link>
            );
          })}
        </Flex>
      </ScrollArea>
    </Skeleton>
  );
};

export default TasksUpcoming;
