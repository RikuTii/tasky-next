import { Task } from "@/types/tasks";
import {
  Flex,
  Text,
  Card,
  Badge,
  Group,
  ScrollArea,
  Container,
} from "@mantine/core";
import { useEffect, useState } from "react";

const TasksUpcoming = (props: {}) => {
  const [upcoming, setUpcoming] = useState<Array<Task> | null>([]);
  const loadUpcomingTasks = async () => {
    const response = await fetch("/api/fetch/tasklist/GetUpcomingTasks/");

    if (!response.ok) {
      return;
    }

    const data = await response.json();
    setUpcoming(data);
  };

  useEffect(() => {
    loadUpcomingTasks();
  }, []);

  return (
    <ScrollArea w="100%">
      <Flex mt={8} mb={8} gap={"lg"} direction={"row"} w={450} pb={8}>
        {upcoming?.map((task: Task) => {
          return (
            <Card
              key={task.id}
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              miw={300}
            >
              <Group position="apart" mt="md" mb="xs">
                <Text weight={500}>{task.title}</Text>
                <Badge color="pink" variant="light">
                  UPCOMING
                </Badge>
              </Group>
              <Text size="sm" color="dimmed">
                {new Date(task.scheduleDate ?? "").toLocaleString()}
              </Text>
            </Card>
          );
        })}
      </Flex>
    </ScrollArea>
  );
};

export default TasksUpcoming;
