"use client";
import React, { useState } from "react";
import "./../../globals.css";
import { useForm } from "@mantine/form";
import {
  Box,
  Group,
  TextInput,
  Button,
  Title,
  Container,
  Center,
  Flex,
  Popover,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useClipboard } from "@mantine/hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

interface TaskForm {
  name: string;
  description: string;
}
async function getClipboardContents() {
  try {
    const clipBoardText = await navigator.clipboard.readText();
    return clipBoardText;
  } catch (err) {
    console.error(err);
  }
}
const CreateTaskList = ({}) => {
  const [taskData, setTaskData] = useState("");

  const form = useForm<TaskForm>({
    initialValues: { name: "", description: "" },
    validate: {
      name: (value) =>
        value.length < 2 ? "Name must have at least 2 letters" : null,
    },
  });
  const clipboard = useClipboard({ timeout: 500 });

  const createTaskList = async (values: TaskForm) => {
    let endpoint = "/api/fetch/tasklist/CreateTaskList";
    if (taskData.length > 0) {
      endpoint = "/api/fetch/tasklist/CreateTaskListWithTasks";
    }

    const res = await fetch(endpoint, {
      method: "POST",
      body: JSON.stringify({
        Name: values.name,
        Description: values.description,
        tasks: taskData.length > 0 ? taskData : undefined,
      }),
    });
    if (!res.ok) {
      notifications.show({
        title: "Error occured",
        message: "Error creating tasklist",
        color: "red",
      });
    } else {
      notifications.show({
        title: "Tasklist created",
        message: values.name,
      });
      form.reset();
    }
  };

  const loadTaskData = async () => {
    const data = await getClipboardContents();
    if (data && data.length) {
      setTaskData(data);
    }
  };

  return (
    <Container fluid w={450} mx="auto">
      <Title order={2}>Create new tasklist</Title>
      <form onSubmit={form.onSubmit((values) => createTaskList(values))}>
        <TextInput
          sx={{ marginBottom: 8 }}
          label="Name"
          placeholder="Name"
          {...form.getInputProps("name")}
        />
        <TextInput
          label="Description"
          placeholder="Description"
          {...form.getInputProps("description")}
        />
        <Group position="right" mt="md">
          <Flex gap="xs" align="center">
            <Popover width={200} position="bottom" withArrow shadow="md">
              <Popover.Target>
                <Button variant="subtle" size="sm" radius={50}>
                  ?
                </Button>
              </Popover.Target>
              <Popover.Dropdown>
                <Text size="xs">
                  Load tasks for this tasklist from clipboard. Use &quot;;&quot; or &quot;,&quot; or
                  new lines to seperate each task
                </Text>
              </Popover.Dropdown>
            </Popover>
            <Button
              variant="outline"
              color={taskData ? "green" : undefined}
              onClick={() => loadTaskData()}
            >
              <Flex gap="xs" align="center">
                <Text>Load tasks from clipboard</Text>
                {taskData && (
                  <FontAwesomeIcon icon={faCheck} color="green" size="1x" />
                )}
              </Flex>
            </Button>
          </Flex>
        </Group>
        <Group position="right" mt="md">
          <Button type="submit" variant="gradient">
            Submit
          </Button>
        </Group>
      </form>
    </Container>
  );
};

export default CreateTaskList;
