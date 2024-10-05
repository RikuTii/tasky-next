import React, { useEffect, useState, useCallback, useRef } from "react";
import { useMediaQuery, useTimeout, useWindowScroll } from "@mantine/hooks";
import { List } from "react-movable";
import { Task, TaskStatus } from "@/types/tasks.d";
import {
  Flex,
  TextInput,
  ThemeIcon,
  UnstyledButton,
  createStyles,
  rem,
} from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faEllipsisVertical,
  faList,
} from "@fortawesome/free-solid-svg-icons";
import { debounce } from "lodash";
import { notifications } from "@mantine/notifications";

const useStyles = createStyles((theme) => ({
  input: {
    backgroundColor: theme.colors.dark[8],
  },
}));

const SortableTaskList = (props: {
  tasks: Array<Task> | undefined;
  tasklistId: number | undefined;
  setTasks: (tasks: Array<Task>) => void;
  onTaskUpdated: (task: Task, orderId: number, updateTasklist: boolean) => void;
  setManageTask: (task: Task) => void;
  refreshTaskLists: (id: number) => void;
  createNewTask: () => void;
}) => {
  const [dragCurrent, setDragCurrent] = useState<Array<number>>([]);
  const [taskBeingRemoved, setTaskBeingRemoved] = useState(-1);
  const autoFocusId = useRef(-1);

  const dragStart = useRef<Array<number>>([]);
  const lastDragDistance = useRef(0);

  const taskToRemove = useRef(-1);
  const activeDragIndex = useRef(0);
  const inputRef = useRef(new Array<HTMLInputElement>());
  const canDrag = useRef(false);

  const { classes } = useStyles();

  const isTouchScreen = useMediaQuery("(hover: none) and (pointer:coarse)");

  const { start, clear } = useTimeout(() => {
    canDrag.current = true;
  }, 100);

  const { start: removeStart, clear: removeEnd } = useTimeout(
    () => onTaskRemoved(),
    500
  );

  const endActiveDrag = () => {
    const copyArray = [...dragCurrent];
    copyArray.forEach((element, index) => {
      copyArray[index] = 0;
      dragStart.current[index] = 0;
    });
    canDrag.current = false;
    setDragCurrent(copyArray);
    activeDragIndex.current = 0;
    clear();
  };

  const onTaskRemoved = () => {
    const task = props.tasks?.find((e) => e.id === taskToRemove.current);
    if (task) {
      removeTask(task);
    }

    const copytask = [...(props.tasks ?? [])];
    const task_idx = props.tasks?.findIndex(
      (e) => e.id === taskToRemove.current
    );
    if (task_idx !== undefined && task_idx > -1) {
      copytask.splice(task_idx, 1);
      props.setTasks(copytask);
    }

    endActiveDrag();
  };

  const pointerEventUp = () => {
    if (canDrag.current && dragStart.current[activeDragIndex.current] > 0) {
      if (lastDragDistance.current > 100) {
        canDrag.current = false;
        setTaskBeingRemoved(taskToRemove.current);
        removeStart();
      } else {
        endActiveDrag();
      }
    }
  };

  const pointerEventMove = (e: PointerEvent) => {
    if (dragStart.current[activeDragIndex.current] > 0 && canDrag.current) {
      const copyArray = [...dragCurrent];
      copyArray[activeDragIndex.current] = e.clientX;
      lastDragDistance.current =
        e.clientX - dragStart.current[activeDragIndex.current];
      setDragCurrent(copyArray);
    }
  };

  const touchEventEnd = (e: TouchEvent) => {
    inputRef.current.forEach((elem) => {
      if (elem) {
        elem.disabled = false;
      }
      canDrag.current = false;
      activeDragIndex.current = 0;
      clear();
    });
  };

  useEffect(() => {
    window.addEventListener("pointerup", pointerEventUp);
    window.addEventListener("pointermove", pointerEventMove);
    window.addEventListener("touchend", touchEventEnd);

    return () => {
      window.removeEventListener("pointerup", pointerEventUp);
      window.removeEventListener("pointermove", pointerEventMove);
      window.removeEventListener("touchend", touchEventEnd);
    };
  }, []);

  useEffect(() => {
    dragStart.current.fill(0, 0, props.tasks?.length);
    setDragCurrent([...dragStart.current]);
    {
      props.tasks?.map((item) => (
        <input
          key={item.id}
          ref={(element: HTMLInputElement) => {
            inputRef.current.push(element);
          }}
        >
          {item.id}
        </input>
      ));
    }
  }, [props.tasks]);

  useEffect(() => {
    const lastTask = props.tasks?.slice(-1);
    if (lastTask && lastTask[0]) {
      const id = lastTask[0].id;
      if (lastTask[0].status === TaskStatus.NotCreated && id) {
        if (props.tasks?.length) {
          autoFocusId.current = props.tasks?.length - 1;
        }
      } else {
        autoFocusId.current = -1;
      }
    }
  }, [props.tasks]);

  const delayedTaskUpdate = useCallback(
    debounce((q: Task) => props.onTaskUpdated(q, 0, false), 300),
    []
  );
  const removeTask = async (task: Task) => {
    const res = await fetch("/api/fetch/task/RemoveTask", {
      method: "POST",
      body: JSON.stringify({
        id: task?.id,
        taskListId: task?.taskListId ?? task?.taskList?.id,
      }),
    });

    if (!res.ok && res.status === 404) {
      if (props.tasklistId) {
        props.refreshTaskLists(props.tasklistId);
      }
    } else {
      if (!res.ok) {
        notifications.show({
          title: "Error occured",
          message: "Error removing task",
          color: "red",
        });
      }
    }
  };

  const reOrderTasks = async (orderedTasks: Task[]) => {
    const res = await fetch("/api/fetch/task/ReOrderTasks", {
      method: "POST",
      body: JSON.stringify({
        taskListId: props.tasklistId,
        tasks: orderedTasks,
      }),
    });

    if (!res.ok) {
      notifications.show({
        title: "Error occured",
        message: "Error in changing task order",
        color: "red",
      });
    } else {
      if (orderedTasks)
        props.refreshTaskLists(
          orderedTasks[0]?.taskListId ?? orderedTasks[0]?.taskList?.id ?? 0
        );
    }
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
    const items: Task[] = reorder(
      props.tasks,
      result.oldIndex,
      result.newIndex
    );

    if (items) {
      reOrderTasks(items);
    }
    props.setTasks(items);
  };

  const renderSingleTask = (task: Task, index: number = 0) => {
    if (
      autoFocusId.current === index &&
      document.activeElement !== inputRef.current[index]
    ) {
      inputRef.current[index].focus();
      inputRef.current[index].setSelectionRange(0, 999);
    }
    const opacity = taskBeingRemoved === task.id ? "0.0" : "1.0";
    const transform = `translateX(${
      dragCurrent[index] - dragStart.current[index]
    }px)`;
    return (
      <Flex
        key={task.id}
        direction="row"
        w="100%"
        gap="md"
        sx={{
          marginBottom: 8,
          touchAction: "pan-y",
          alignItems: "center",
          opacity: opacity,
          transformOrigin: "0% 0%",
          transform:
            (dragStart.current[index] > 0 && dragCurrent[index] > 0) ||
            taskBeingRemoved === task.id
              ? transform
              : "",
          transition: "opacity 0.5s ease-in-out;",
          overflow: "hidden",
        }}
      >
        <FontAwesomeIcon icon={faList} color="white" size="1x" />

        <TextInput
          w="100%"
          enterKeyHint="done"
          placeholder=""
          tabIndex={0}
          autoFocus={index === autoFocusId.current}
          classNames={{
            input: task.status === TaskStatus.Done ? classes.input : "",
          }}
          sx={{
            textDecorationLine:
              task.status === TaskStatus.Done ? "line-through" : "",
            textDecorationThickness: 1,
            textDecorationColor: "white",
          }}
          onContextMenu={(e) => {
            if (document.activeElement !== inputRef.current[index]) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
          ref={(element) => {
            if (element) inputRef.current[index] = element;
          }}
          onKeyUp={(e) => {
            if (e.code === "Enter") {
              props.createNewTask();
            }
          }}
          rightSection={
            <UnstyledButton
              onClick={() => {
                props.setManageTask(task);
              }}
              p={rem(12)}
            >
              <Flex
                align="center"
                gap="xs"
                justify="flex-end"
                sx={{
                  marginRight:
                    task.meta && task.meta?.length > 0 ? "2.25rem" : 0,
                }}
              >
                {task.meta && task.meta.length > 0 && (
                  <ThemeIcon radius="xl" color="dark">
                    {task.meta.length}
                  </ThemeIcon>
                )}
                <FontAwesomeIcon
                  icon={faEllipsisVertical}
                  color="white"
                  size="1x"
                />
              </Flex>
            </UnstyledButton>
          }
          onPointerDown={(e) => {
            if (document.activeElement !== inputRef.current[index]) {
              e.stopPropagation();
              e.preventDefault();
              dragStart.current[index] = e.clientX;
              activeDragIndex.current = index;
              taskToRemove.current = task.id ?? -1;
              start();
              if (isTouchScreen) inputRef.current[index].disabled = true;
            }
          }}
          onPointerUp={(e) => {
            clear();
            if (isTouchScreen) inputRef.current[index].disabled = false;
            if (!canDrag.current) inputRef.current[index].focus();
          }}
          value={task.title}
          onChange={(event) => {
            const newTask = { ...task, title: event.target.value };
            const tasks = [...(props.tasks ?? [])];
            tasks?.splice(tasks.indexOf(task), 1, newTask);
            props.setTasks([...(tasks ?? [])]);
            delayedTaskUpdate(newTask);
          }}
        />

        <UnstyledButton>
          <div
            style={{
              width: 25,
              height: 25,
              border: "2px solid white",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => {
              const newTask = { ...task };

              if (newTask) {
                if (!newTask.status || newTask.status === TaskStatus.NotDone) {
                  newTask.status = TaskStatus.Done;
                } else {
                  newTask.status = TaskStatus.NotDone;
                }
                const tasks = [...(props.tasks ?? [])];
                tasks?.splice(tasks.indexOf(task), 1, newTask);
                props.setTasks([...(tasks ?? [])]);
                props.onTaskUpdated(newTask, 0, false);
              }
            }}
          >
            <div
              style={{
                marginLeft: 4,
                marginRight: 8,
                opacity: task.status === TaskStatus.Done ? "1.0" : "0.0",
                transition: "0.2s ease-in-out opacity",
              }}
            >
              <FontAwesomeIcon icon={faCheck} color="white" size="1x" />
            </div>
          </div>
        </UnstyledButton>
      </Flex>
    );
  };

  if (!props.tasks || !props.tasks.length) return <></>;

  return (
    <>
      <List
        values={props.tasks}
        onChange={onDragEnd}
        renderList={({ children, props }) => <div {...props}>{children}</div>}
        renderItem={({ value, props, index }: any) => (
          <div {...props} key={value.id}>
            {renderSingleTask(value, index)}
          </div>
        )}
      />
    </>
  );
};

export default SortableTaskList;
