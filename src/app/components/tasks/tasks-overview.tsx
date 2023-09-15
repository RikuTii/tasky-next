"use client";
import "./../../globals.css";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { Tasklist, Task, TaskStatus } from "@/types/tasks.d";
import {
  Container,
  Flex,
  Select,
  NavLink,
  MediaQuery,
  Button,
  Box,
  rem,
  Modal,
  Divider,
  Skeleton,
} from "@mantine/core";
import { forEach } from "lodash";
import { useSession } from "next-auth/react";
import { useDisclosure } from "@mantine/hooks";
import ManageTask from "./manage-task";
import SortableTaskList from "./sortable-tasklist";
import { set, get } from "idb-keyval";

const TasksListing = ({}) => {
  const { data: session, status, update } = useSession();

  const [currentTaskList, setCurrentTaskList] = useState<Tasklist>();
  const [taskLists, setTaskLists] = useState<Tasklist[]>();
  const [tasks, setTasks] = useState<Array<Task>>();
  const [manageTask, setManageTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  const [opened, { open, close }] = useDisclosure(false, {
    onClose: () => setManageTask(null),
  });

  useEffect(() => {
    setLoading(true);
    loadTaskLists();
  }, []);

  const loadTaskLists = async () => {
    const response = await fetch("/api/fetch/tasklist/Index");
    const data = await response.json();
    let listExists = false;

    const tasklist_id = await get("tasklist_id");
    forEach(data, (taskList: Tasklist) => {
      if (taskList.id == tasklist_id) {
        setCurrentTaskList(taskList);
        listExists = true;
      }
    });

    if (!listExists) {
      setCurrentTaskList(data[0]);
    }
    setLoading(false);
    setTaskLists(data);
  };

  const refreshTaskLists = async (id: number) => {
    const response = await fetch("/api/fetch/tasklist/Index");
    const data = await response.json();
    setTaskLists(data);
    forEach(data, (taskList: Tasklist) => {
      if (taskList.id == id) {
        setCurrentTaskList(taskList);
      }
    });
  };

  useEffect(() => {
    setTasks(currentTaskList?.tasks);
    if (currentTaskList && currentTaskList.tasks) {
      if (manageTask) {
        currentTaskList.tasks.forEach((task: Task) => {
          if (task.id === manageTask.id) {
            setManageTask({ ...task });
          }
        });
      }
    }
  }, [currentTaskList]);

  const createNewTask = () => {
    let id = 1;
    if (tasks && tasks?.length > 0) {
      tasks.forEach((task: Task) => {
        if (task.id && task.id > id) {
          id = task.id;
        }
      });
    }
    let nextId = id + 1;

    const newTask: Task = {
      id: nextId,
      title: "",
      createdDate: new Date().toISOString(),
      creator: session?.user?.id,
      status: TaskStatus.NotCreated,
      taskList: currentTaskList,
      taskListId: currentTaskList?.id,
    };

    onTaskUpdated(newTask);

    if (tasks) {
      const newTasks = [...tasks];
      newTasks.push(newTask);
      setTasks(newTasks);
    }
  };

  const onTaskUpdated = async (task: Task, orderId: number = 0) => {
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
        scheduleDate: task?.scheduleDate,
        taskListId: task?.taskListId ?? task?.taskList?.id,
        order_task: orderId ?? 0,
      }),
    })
      .then(() => {
        refreshTaskLists(task?.taskListId ?? task?.taskList?.id ?? 0);
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  const setActiveTaskList = (tasklist: Tasklist) => {
    setCurrentTaskList(tasklist);
    set("tasklist_id", tasklist.id);
  };

  const doneTasks = tasks?.filter((e) => e.status === TaskStatus.Done);
  const pendingTasks = tasks?.filter((e) => e.status !== TaskStatus.Done);
  const filteredTasks = pendingTasks?.concat(doneTasks ?? []);

  return (
    <Skeleton visible={loading}>
      <Container mih={400} w={800} fluid p={0}>
        <Divider size="md" my="xs" />
        <Flex direction={"row"} pl={0}>
          <MediaQuery smallerThan="sm" styles={{ display: "none" }}>
            <Box w="50%">
              <Container
                px="lg"
                fluid
                sx={(theme) => ({
                  borderRightColor: theme.colors.dark[4],
                  borderRightWidth: rem(2),
                  borderRightStyle: "solid",
                })}
              >
                <Divider size="xs" my="xs" />
                {taskLists?.map((tasklist: Tasklist) => {
                  return (
                    <NavLink
                      key={"nav" + tasklist.id}
                      label={tasklist.name}
                      active={tasklist.id === currentTaskList?.id}
                      onClick={(e) => setActiveTaskList(tasklist)}
                    />
                  );
                })}
              </Container>
            </Box>
          </MediaQuery>
          <MediaQuery
            smallerThan="sm"
            styles={{ width: "100%", marginLeft: 0 }}
          >
            <Box w="50%" sx={{ overflow: "clip" }} ml={rem(8)}>
              <MediaQuery largerThan="sm" styles={{ display: "none" }}>
                <Select
                  style={{ marginBottom: 8 }}
                  value={String(currentTaskList?.id)}
                  data={
                    taskLists?.map((tasklist: Tasklist) => ({
                      value: String(tasklist.id),
                      label: tasklist.name ?? "",
                    })) ?? []
                  }
                  onChange={(e) =>
                    setCurrentTaskList(
                      taskLists?.find((t) => t.id === Number(e))
                    )
                  }
                />
              </MediaQuery>

              <SortableTaskList
                tasks={tasks}
                tasklistId={currentTaskList?.id}
                setTasks={setTasks}
                onTaskUpdated={onTaskUpdated}
                refreshTaskLists={refreshTaskLists}
                setManageTask={(task: Task) => {
                  setManageTask(task);
                  open();
                }}
              />

              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  sx={{ marginTop: 8 }}
                  variant="gradient"
                  gradient={{ from: "indigo", to: "cyan" }}
                  onClick={createNewTask}
                >
                  New
                </Button>
              </Box>
            </Box>
          </MediaQuery>
        </Flex>
        <Modal opened={opened} onClose={close} title="Manage task" size="xl">
          <Box
            sx={(theme) => ({
              backgroundColor: theme.colors.dark[6],
              padding: rem(8),
            })}
          >
            <ManageTask
              task={manageTask}
              onTaskUpdated={onTaskUpdated}
            ></ManageTask>
          </Box>
        </Modal>
      </Container>
    </Skeleton>
  );
};

export default TasksListing;
