"use client";
import "./../../globals.css";
import React, { useEffect, useState, useContext, useCallback } from "react";
import { Tasklist, Task, TaskStatus } from "@/types/tasks.d";
import {
  Container,
  Flex,
  Select,
  Loader,
  Center,
  SimpleGrid,
  Text,
  Title,
  Grid,
  NavLink,
  CSSObject,
  MediaQuery,
  Button,
  Box,
  rem,
  TextInput,
} from "@mantine/core";
import debounce from "lodash/debounce";
import { forEach } from "lodash";
import { useSession } from "next-auth/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faList,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { List, arrayMove } from "react-movable";

const hideElement: CSSObject = {
  display: "none",
};

const showElement: CSSObject = {
  display: "flex",
};

const TasksListing = ({}) => {
  const { data: session, status } = useSession();

  const [currentTaskList, setCurrentTaskList] = useState<Tasklist>();
  const [taskLists, setTaskLists] = useState<Tasklist[]>();
  const [tasks, setTasks] = useState<Array<Task>>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTaskLists();
  }, []);

  const loadTaskLists = async () => {
    const response = await fetch("/api/fetch/tasklist/Index");
    const data = await response.json();
    setCurrentTaskList(data[0]);
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
    if (tasks) {
      const newTasks = [...tasks];
      newTasks.push(newTask);
      setTasks(newTasks);
    }
  };

  const delayedTaskUpdate = useCallback(
    debounce((q: Task) => onTaskUpdated(q), 1000),
    []
  );

  const onTaskUpdated = async (task: Task, orderId: number = 0) => {
    fetch("/api/fetch/task/CreateOrUpdateTask", {
      method: "POST",
      body: JSON.stringify({
        title: task?.title,
        id: task?.id,
        status: task?.status,
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

  const removeTask = async (task: Task) => {
    fetch("/api/fetch/task/RemoveTask", {
      method: "POST",
      body: JSON.stringify({
        id: task?.id,
        taskListId: task?.taskListId ?? task?.taskList?.id,
      }),
    })
      .then(() => {
        refreshTaskLists(task?.taskListId ?? task?.taskList?.id ?? 0);
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  const doneTasks = tasks?.filter((e) => e.status === TaskStatus.Done);
  const pendingTasks = tasks?.filter((e) => e.status !== TaskStatus.Done);

  const filteredTasks = pendingTasks?.concat(doneTasks ?? []);

  const reOrderTasks = async (orderedTasks: Task[]) => {
    fetch("/api/fetch/task/ReOrderTasks", {
      method: "POST",
      body: JSON.stringify({
        taskListId: currentTaskList?.id,
        tasks: orderedTasks,
      }),
    })
      .then(() => {
        if (orderedTasks)
          refreshTaskLists(
            orderedTasks[0]?.taskListId ?? orderedTasks[0]?.taskList?.id ?? 0
          );
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  const reorder = (
    list: Task[] | undefined,
    startIndex: number,
    endIndex: number
  ) => {
    const result: Task[] = Array.from(list ?? []);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  const onDragEnd = (result: any) => {
    const items: Task[] = reorder(tasks, result.oldIndex, result.newIndex);

    if (items) {
      reOrderTasks(items);
    }
    setTasks(items);
  };

  const renderSingleTask = (task: Task) => {
    return (
      <Flex key={task.id} direction="row" gap="md" sx={{ marginBottom: 8, alignItems: 'center' }}>
        <FontAwesomeIcon icon={faList} color="white" size="1x" />
        <TextInput
          type="textarea"
          placeholder=""
          value={task.title}
          onChange={(event) => {
            const newTasks = [...(tasks ?? [])];
            const currentTask = newTasks.find((e) => e.id === task.id);
            if (currentTask) {
              currentTask.title = event.target.value;
              setTasks(newTasks);
              delayedTaskUpdate(currentTask);
            }
          }}
        />
        <div
          style={{
            width: 25,
            height: 25,
            border: "2px solid white",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => {
            const newTasks = [...(tasks ?? [])];
            const currentTask = newTasks.find((e) => e.id === task.id);
            if (currentTask) {
              if (
                !currentTask.status ||
                currentTask.status === TaskStatus.NotDone
              ) {
                currentTask.status = TaskStatus.Done;
              } else {
                currentTask.status = TaskStatus.NotDone;
              }
              delayedTaskUpdate(currentTask);
              setTasks(newTasks);
            }
          }}
        >
          {task.status === TaskStatus.Done && (
            <div style={{ marginLeft: 4, marginRight: 8 }}>
              <FontAwesomeIcon icon={faCheck} color="white" size="1x" />
            </div>
          )}
        </div>
        <div onClick={() => removeTask(task)}>
          <FontAwesomeIcon icon={faTrash} color="red" size="xl" />
        </div>
      </Flex>
    );
  };

  if (loading) {
    return (
      <Center maw={400} h={100} mx="auto">
        <Loader />
      </Center>
    );
  }

  return (
    <Box sx={{ margin: 10 }}>
      <Title order={1} sx={{ marginBottom: 8 }}>
        Current Tasks
      </Title>

      <Flex direction={"row"}>
        <MediaQuery smallerThan="sm" styles={hideElement}>
          <Box>
            <Container
              size="xs"
              sx={(theme) => ({
                borderRightColor: theme.colors.dark[4],
                borderRightWidth: rem(2),
                borderRightStyle: "solid",
              })}
            >
            <Text fz="lg">Tasklists</Text>
              {taskLists?.map((tasklist: Tasklist) => {
                return (
                  <NavLink
                    key={"nav" + tasklist.id}
                    label={tasklist.name}
                    active={tasklist.id === currentTaskList?.id}
                    onClick={(e) => setCurrentTaskList(tasklist)}
                  />
                );
              })}
            </Container>
          </Box>
        </MediaQuery>

        <Box>
          <Container size="md">
            <MediaQuery largerThan="sm" styles={hideElement}>
              <Select
                label="Tasklists"
                style={{ marginBottom: 8 }}
                value={String(currentTaskList?.id)}
                data={
                  taskLists?.map((tasklist: Tasklist) => ({
                    value: String(tasklist.id),
                    label: tasklist.name ?? "",
                  })) ?? []
                }
                onChange={(e) =>
                  setCurrentTaskList(taskLists?.find((t) => t.id === Number(e)))
                }
              />
            </MediaQuery>

            {tasks && (
              <List
                values={tasks}
                onChange={onDragEnd}
                renderList={({ children, props }) => (
                  <div {...props}>{children}</div>
                )}
                renderItem={({ value, props }) => (
                  <div>
                    {renderSingleTask(value)}
                  </div>
                )}
              />
            )}

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
          </Container>
        </Box>
      </Flex>
    </Box>
  );
};

export default TasksListing;
