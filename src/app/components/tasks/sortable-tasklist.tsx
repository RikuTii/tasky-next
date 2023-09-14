import React, { useEffect, useState, useCallback, useRef } from "react";
import { useTimeout } from "@mantine/hooks";
import { List } from "react-movable";
import { Task, TaskStatus } from "@/types/tasks.d";
import { Flex, TextInput, UnstyledButton, rem } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faEllipsisVertical,
  faList,
} from "@fortawesome/free-solid-svg-icons";
import { debounce } from "lodash";

const SortableTaskList = (props: {
  tasks: Array<Task> | undefined;
  tasklistId: number | undefined;
  setTasks: (tasks: Array<Task>) => void;
  onTaskUpdated: (task: Task) => void;
  setManageTask: (task: Task) => void;
  refreshTaskLists: (id: number) => void;
}) => {
  const dragStart = useRef<Array<number>>([]);
  const [dragCurrent, setDragCurrent] = useState<Array<number>>([]);
  const lastDragDistance = useRef(0);
  const canDrag = useRef(false);
  const { start, clear } = useTimeout(() => {
    canDrag.current = true;
  }, 1000);
  const taskToRemove = useRef(-1);
  const [taskBeingRemoved, setTaskBeingRemoved] = useState(-1);

  const { start: removeStart, clear: removeEnd } = useTimeout(() => {
    const task = props.tasks?.find((e) => e.id === taskToRemove.current);
    if (task) {
      removeTask(task);
    }

    const copytask = [...(props.tasks ?? [])];
    const task_idx = props.tasks?.findIndex(
      (e) => e.id === taskToRemove.current
    );
    if (task_idx) {
      copytask.splice(task_idx, 1);
      props.setTasks(copytask);
    }

    const copyArray = [...dragCurrent];
    copyArray.forEach((element, index) => {
      copyArray[index] = 0;
      dragStart.current[index] = 0;
    });
    canDrag.current = false;
    setDragCurrent(copyArray);
    activeDragIndex.current = 0;
    clear();
  }, 1000);

  const activeDragIndex = useRef(0);
  const inputRef = useRef(new Array<HTMLInputElement>());

  const pointerEventUp = () => {
    if (canDrag.current && dragStart.current[activeDragIndex.current] > 0) {
      if (lastDragDistance.current > 100) {
        canDrag.current = false;
        setTaskBeingRemoved(taskToRemove.current);
        removeStart();
        return;
      }

      const copyArray = [...dragCurrent];
      copyArray.forEach((element, index) => {
        copyArray[index] = 0;
        dragStart.current[index] = 0;
      });
      canDrag.current = false;
      setDragCurrent(copyArray);
      activeDragIndex.current = 0;
      clear();
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

  useEffect(() => {
    window.addEventListener("pointerup", pointerEventUp);
    window.addEventListener("pointermove", pointerEventMove);

    return () => {
      window.removeEventListener("pointerup", pointerEventUp);
      window.removeEventListener("pointermove", pointerEventMove);
    };
  }, []);

  useEffect(() => {
    dragStart.current.fill(0, 0, props.tasks?.length);
    setDragCurrent([...dragStart.current]);
    {
      props.tasks?.map((item) => (
        <input
          key={item.id}
          ref={(element: HTMLInputElement) => inputRef.current.push(element)}
        >
          {item.id}
        </input>
      ));
    }
  }, [props.tasks]);

  const delayedTaskUpdate = useCallback(
    debounce((q: Task) => props.onTaskUpdated(q), 1000),
    []
  );
  const removeTask = async (task: Task) => {
    fetch("/api/fetch/task/RemoveTask", {
      method: "POST",
      body: JSON.stringify({
        id: task?.id,
        taskListId: task?.taskListId ?? task?.taskList?.id,
      }),
    })
      .then(() => {
        props.refreshTaskLists(task?.taskListId ?? task?.taskList?.id ?? 0);
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  const reOrderTasks = async (orderedTasks: Task[]) => {
    fetch("/api/fetch/task/ReOrderTasks", {
      method: "POST",
      body: JSON.stringify({
        taskListId: props.tasklistId,
        tasks: orderedTasks,
      }),
    })
      .then(() => {
        if (orderedTasks)
          props.refreshTaskLists(
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
          touchAction: "none",   
          alignItems: "center",
          opacity: opacity,
          transformOrigin: "0% 0%",
          transform: dragStart.current[index] > 0 && dragCurrent[index] > 0 ? transform : "",
          transition: "opacity 1s ease-in-out;",
          overflow: "hidden",
        }}
      >
        <FontAwesomeIcon icon={faList} color="white" size="1x" />

        <TextInput
          w="100%"
          placeholder=""
          sx={{touchAction: "none"}}
          ref={(element: HTMLInputElement) =>
            (inputRef.current[index] = element)
          }
          rightSection={
            <UnstyledButton
              onClick={() => {
                props.setManageTask(task);
              }}
              p={rem(12)}
            >
              <FontAwesomeIcon
                icon={faEllipsisVertical}
                color="white"
                size="1x"
              />
            </UnstyledButton>
          }
          onPointerDown={(e) => {
            dragStart.current[index] = e.clientX;
            activeDragIndex.current = index;
            taskToRemove.current = task.id ?? -1;
            start();
            e.preventDefault();
          }}
          onPointerUp={(e) => {
            clear();
            inputRef.current[index].focus();
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
                props.onTaskUpdated(newTask);
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

  return (
    <>
      <List
        values={props.tasks ?? []}
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
