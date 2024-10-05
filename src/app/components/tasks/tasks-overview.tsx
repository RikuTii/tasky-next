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
  createStyles,
  UnstyledButton,
} from "@mantine/core";
import { useSession } from "next-auth/react";
import { useDisclosure, useTimeout } from "@mantine/hooks";
import ManageTask from "./manage-task";
import SortableTaskList from "./sortable-tasklist";
import { set, get } from "idb-keyval";
import { notifications } from "@mantine/notifications";

const useStyles = createStyles((theme) => ({
  addButtonContainer: {
    justifyContent: "center",
    alignItems: "center",
    display: "none",
    position: "fixed",
    bottom: rem(8),
    zIndex: 10,
    right: rem(8),
    textAlign: "center",
    backgroundColor: theme.colors.dark[7],
    borderRadius: 50,
    borderWidth: 2,
    borderColor: theme.colors.blue[2],
    borderStyle: "solid",
    transition: "linear 0.5s all",
  },
  addButtonActive: {
    borderColor: theme.colors.blue[6],
  },
  plusSignX: {
    width: 19,
    height: 3,
    position: "absolute",
    backgroundColor: "white",
  },
  plusSignY: {
    width: 3,
    height: 19,
    position: "absolute",
    backgroundColor: "white",
  },
}));

const TasksListing = ({}) => {
  const { data: session, status, update } = useSession();

  const [currentTaskList, setCurrentTaskList] = useState<Tasklist>();
  const [taskLists, setTaskLists] = useState<Tasklist[]>();
  const [tasks, setTasks] = useState<Array<Task>>();
  const [manageTask, setManageTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingTaskList, setLoadingTasklist] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [creationDisabled, setCreationDisabled] = useState(false);
  const [animateAddButon, setAnimateAddButton] = useState(false);
  const { start, clear } = useTimeout(() => setAnimateAddButton(false), 500);
  const { classes, cx } = useStyles();

  const latestTask = useRef<Task>({});

  const [opened, { open, close }] = useDisclosure(false, {
    onClose: () => setManageTask(null),
  });

  useEffect(() => {
    setLoading(true);
    loadTaskLists();
  }, []);

  const loadTaskLists = async () => {
    const response = await fetch("/api/fetch/tasklist/Index");
    if (response.ok) {
      const data = await response.json();
      let listExists = false;
      const tasklist_id = await get("tasklist_id");
      data.forEach((taskList: Tasklist) => {
        if (taskList.id === tasklist_id) {
          setCurrentTaskList(taskList);
          listExists = true;
        }
      });

      if (!listExists) {
        setCurrentTaskList(data[0]);
      }
      setLoadingTasklist(false);
      setLoading(false);
      setTaskLists(data);
      setInitialLoad(false);
    }
  };

  const refreshTaskList = async (
    id: number,
    signal?: AbortSignal
  ): Promise<Task[]> => {
    const response = await fetch(`/api/fetch/tasklist/GetTaskList/${id}`, {
      signal,
    });
    if (response.ok) {
      let tasks: Task[] = [];
      const updatedList: Tasklist = await response.json();
      if (taskLists) {
        taskLists.forEach((taskList: Tasklist) => {
          if (taskList.id === updatedList.id) {
            setCurrentTaskList(updatedList);
            const newTaskLists = [...taskLists];
            const list = newTaskLists.find((e) => e.id === updatedList.id);
            if (list) {
              list.tasks = updatedList.tasks;
              setTaskLists(newTaskLists);
              tasks = updatedList.tasks ?? [];
            }
          }
        });
      }
      setLoadingTasklist(false);
      return tasks;
    }

    return [];
  };

  const refreshTasklistTasks = async (id: number, signal?: AbortSignal) => {
    const tasks = await refreshTaskList(id, signal);
    setTasks(tasks);
    if (currentTaskList && tasks) {
      if (manageTask) {
        tasks.forEach((task: Task) => {
          if (task.id === manageTask.id) {
            setManageTask({ ...task });
          }
        });
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    if (currentTaskList?.id) {
      setLoadingTasklist(true);
      refreshTasklistTasks(currentTaskList.id, signal);
    }

    return () => controller.abort();
  }, [currentTaskList?.id]);

  const createNewTask = async () => {
    if(creationDisabled) return;
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
      meta: [],
    };

    latestTask.current = newTask;
    if (tasks) {
      const newTasks = [...tasks];
      newTasks.push(newTask);
      setTasks(newTasks);
    }
    await onTaskUpdated(newTask, 0, false);
  };

  const onTaskUpdated = async (
    task: Task,
    orderId: number = 0,
    updateTasklist: boolean = false
  ) => {
    setCreationDisabled(true);
    const res = await fetch("/api/fetch/task/CreateOrUpdateTask", {
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
    });

    if (!res.ok) {
      notifications.show({
        title: "Error occured",
        message: "Error updating task",
        color: "red",
      });
    } else {
      const updatedTask: Task = await res.json();
      if (updatedTask.status !== 0) {
        const newTasks = [...(tasks ?? []), updatedTask];
        setTasks(newTasks);
      }

    setCreationDisabled(false);

      if (updateTasklist) {
        setLoadingTasklist(true);
        refreshTasklistTasks(task?.taskListId ?? task?.taskList?.id ?? 0);
      }
    }
  };

  const setActiveTaskList = async (tasklist: Tasklist | undefined) => {
    if (tasklist) {
      await set("tasklist_id", tasklist.id);
      setCurrentTaskList(tasklist);
    }
  };

  const doneTasks = tasks?.filter((e) => e.status === TaskStatus.Done);
  const pendingTasks = tasks?.filter((e) => e.status !== TaskStatus.Done);
  const filteredTasks = pendingTasks?.concat(doneTasks ?? []);

  return (
    <>
      <MediaQuery smallerThan="sm" styles={{ display: "flex" }}>
        <UnstyledButton
          tabIndex={0}
          w={58}
          h={58}
          className={cx(classes.addButtonContainer, {
            [classes.addButtonActive]: animateAddButon,
          })}
          onClick={() => {
            setAnimateAddButton(true);
            start();
            createNewTask();
          }}
        >
          <Flex justify={"center"} align="center">
            <Box className={classes.plusSignX}></Box>
            <Box className={classes.plusSignY}></Box>
          </Flex>
        </UnstyledButton>
      </MediaQuery>
      <Skeleton visible={loading}>
        <MediaQuery largerThan="md" styles={{ width: 800 }}>
          <Container mih={400} w="80vw" fluid p={0} pb={rem(60)}>
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
                        setActiveTaskList(
                          taskLists?.find((t) => t.id === Number(e))
                        )
                      }
                    />
                  </MediaQuery>

                  <Skeleton visible={loadingTaskList} p={rem(4)}>
                    <SortableTaskList
                      tasks={tasks}
                      tasklistId={currentTaskList?.id}
                      setTasks={setTasks}
                      onTaskUpdated={onTaskUpdated}
                      createNewTask={createNewTask}
                      refreshTaskLists={refreshTasklistTasks}
                      setManageTask={(task: Task) => {
                        setManageTask(task);
                        open();
                      }}
                    />
                  </Skeleton>
                  <MediaQuery smallerThan="sm" styles={{ display: "none" }}>
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
                  </MediaQuery>
                </Box>
              </MediaQuery>
            </Flex>
            <Modal
              opened={opened}
              onClose={close}
              title="Manage task"
              size="xl"
            >
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
        </MediaQuery>
      </Skeleton>
    </>
  );
};

export default TasksListing;
