"use client";
import { Task } from "@/types/tasks";
import {
  Button,
  Group,
  Title,
  Grid,
  Flex,
  CopyButton,
  Tooltip,
  ActionIcon,
} from "@mantine/core";
import { useEffect, useState } from "react";
import TimeTrack from "./task-timetrack";
import TaskGeneral from "./task-general";
import { faCheck, faShare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const ManageTask = (props: {
  task: Task | null;
  taskId?: string;
  onTaskUpdated?: (task: Task) => void;
}) => {
  const [localTask, setLocalTask] = useState<Task | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);

  useEffect(() => {
    setLocalTask(props.task);
  }, [props.task]);

  const loadTask = async () => {
    const response = await fetch("/api/fetch/tasklist/GetTask/" + props.taskId);
    const data = await response.json();
    setLocalTask(data);
  };

  const onTaskUpdated = async (task: Task) => {
    fetch("/api/fetch/task/CreateOrUpdateTask", {
      method: "POST",
      body: JSON.stringify({
        title: task?.title,
        description: task?.description,
        id: task?.id,
        status: task?.status,
        timeTrack: task?.timeTrack,
        timeElapsed: task?.timeElapsed,
        timeEstimate: task?.timeEstimate,
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
      loadTask();
    }
  }, [props.taskId]);

  if (localTask === null) return <></>;

  const doTaskUpdate = () => {
    if (props.onTaskUpdated) {
      props.onTaskUpdated(localTask);
    } else {
      onTaskUpdated(localTask);
    }
  };

  const onTaskLocalUpdated = (task: Task) => {
    setLocalTask({ ...task });
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
    <div>
      <Flex justify={"space-between"} align={"center"}>
        <Title order={3}>{localTask.title}</Title>
        <CopyButton
          value={`http://localhost:3000/tasklist/task/${localTask.id}`}
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
        <Grid.Col span={6}>
          <TaskGeneral
            onTaskUpdated={onTaskLocalUpdated}
            task={localTask}
            attachments={attachments}
            onFilesAdded={setAttachments}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <TimeTrack onTaskUpdated={onTaskLocalUpdated} task={localTask} />
        </Grid.Col>
      </Grid>

      <Group position="right" my={8}>
        <Button variant="filled" onClick={saveTaskChanges}>
          Save changes
        </Button>
      </Group>
    </div>
  );
};

export default ManageTask;
