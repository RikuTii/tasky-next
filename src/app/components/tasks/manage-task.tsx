"use client";
import { Task, TaskMeta } from "@/types/tasks";
import {
  Button,
  Group,
  Title,
  Grid,
  Flex,
  CopyButton,
  Tooltip,
  ActionIcon,
  Center,
  Loader,
  MediaQuery,
  Box,
  Container,
  Skeleton,
} from "@mantine/core";
import { useEffect, useState } from "react";
import TimeTrack from "./task-timetrack";
import TaskGeneral from "./task-general";
import { faCheck, faShare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { notifications } from "@mantine/notifications";

const ManageTask = (props: {
  task: Task | null;
  taskId?: string;
  onTaskUpdated?: (task: Task) => Promise<void>;
}) => {
  const [localTask, setLocalTask] = useState<Task | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attachments, setAttachments] = useState<File[]>([]);

  useEffect(() => {
    setLocalTask(props.task);
  }, [props.task]);

  const loadTask = async () => {
    const response = await fetch("/api/fetch/tasklist/GetTask/" + props.taskId);

    if (!response.ok) {
      setUnauthorized(true);
      return;
    }

    const data = await response.json();
    setLoading(false);
    setLocalTask(data);
  };

  const onTaskUpdated = async (task: Task) => {
    fetch("/api/fetch/task/CreateOrUpdateTask", {
      method: "POST",
      body: JSON.stringify({
        title: task.title,
        description: task.description,
        id: task.id,
        status: task.status,
        timeTrack: task.timeTrack,
        timeElapsed: task.timeElapsed,
        timeEstimate: task.timeEstimate,
        scheduleDate: task.scheduleDate,
        taskListId: task?.taskListId ?? task?.taskList?.id,
      }),
    })
      .then(() => {
        loadTask();
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  useEffect(() => {
    if (props.taskId) {
      setLoading(true);
      loadTask();
    } else {
      setLoading(false);
    }
  }, [props.taskId]);

  if (unauthorized) {
    return (
      <Center>
        <Title order={1}>Unauthorized</Title>
      </Center>
    );
  }

  if (localTask === null) return <></>;

  const doTaskUpdate = async () => {
    if (props.onTaskUpdated) {
      await props.onTaskUpdated(localTask);
    } else {
      await onTaskUpdated(localTask);
    }

    notifications.show({
      title: "Task has been updated",
      message: localTask.title + " updated",
    });
  };

  const onTaskLocalUpdated = (task: Task) => {
    setLocalTask({ ...task });
  };

  const onTaskScheduleChange = (date: string) => {
    setLocalTask({ ...localTask, scheduleDate: date });
  };

  const addAttachments = async () => {
    let formData = new FormData();
    attachments.forEach((file) => {
      formData.append("files", file);
    });

    formData.append("task_id", String(localTask.id));
    await fetch("/api/uploadfile", {
      method: "POST",
      body: formData,
    });
  };

  const removeAttachment = async (taskMeta: TaskMeta) => {
    fetch("/api/fetch/task/RemoveAttachment", {
      method: "POST",
      body: JSON.stringify({
        id: taskMeta.id,
      }),
    })
      .then(() => {
        saveTaskChanges();
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  const saveTaskChanges = async () => {
    if (attachments && attachments.length > 0) {
      await addAttachments();
      doTaskUpdate();
      setAttachments([]);
    } else {
      doTaskUpdate();
    }
  };

  return (
    <Skeleton visible={loading}>
      <MediaQuery largerThan="sm" styles={{ margin: props.taskId ? 150 : 0 }}>
        <Container px={props.taskId ? "lg" : ""} fluid>
          <Flex justify="space-between" align="center">
            <Title order={3}>{localTask.title}</Title>
            <CopyButton
              value={`${process.env.NEXT_PUBLIC_APP_DOMAIN}/tasklist/task/${localTask.id}`}
              timeout={2000}
            >
              {({ copied, copy }) => (
                <Tooltip
                  label={copied ? "Copied" : "Share"}
                  withArrow
                  position="right"
                >
                  <ActionIcon color={copied ? "teal" : "gray"} onClick={copy}>
                    {copied ? (
                      <FontAwesomeIcon icon={faCheck} color="white" size="sm" />
                    ) : (
                      <FontAwesomeIcon icon={faShare} color="white" size="sm" />
                    )}
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
          </Flex>
          <Grid>
            <Grid.Col md={6} lg={6}>
              <TaskGeneral
                onTaskUpdated={onTaskLocalUpdated}
                task={localTask}
                attachments={attachments}
                onFilesAdded={setAttachments}
                onFileRemove={removeAttachment}
                onScheduleChange={onTaskScheduleChange}
              />
            </Grid.Col>
            <Grid.Col md={6} lg={6}>
              <TimeTrack onTaskUpdated={onTaskLocalUpdated} task={localTask} />
            </Grid.Col>
          </Grid>

          <Group position="right" my={8}>
            <Button
              variant="gradient"
              gradient={{ from: "indigo", to: "cyan" }}
              onClick={saveTaskChanges}
            >
              Save changes
            </Button>
          </Group>
        </Container>
      </MediaQuery>
    </Skeleton>
  );
};

export default ManageTask;
