import { Task } from "@/types/tasks";
import {
  Box,
  Button,
  Group,
  TextInput,
  Text,
  Switch,
  Progress,
  Tooltip,
  Divider,
} from "@mantine/core";
import { useEffect, useState } from "react";
const parseTimeInput = (oldinput: string, input: string) => {
  return input.match("^[0-9mhwds ]*$")?.join("") ?? oldinput;
};

const validateInput = (input: string) => {
  let timeMs = 0;
  for (let iter = 0; iter < input.length; iter++) {
    const char = input.at(iter);
    if (!char) break;
    let subIter = 0;
    if (char.match("^[0-9]*$")) {
      for (; subIter < input.length; ) {
        const subChar = input.at(iter + subIter);
        if (!subChar) break;
        if (subChar.match("^[mhwds]*$")) {
          const timeStr = input.substring(iter, iter + subIter);
          const time = Number(timeStr);
          if (subChar === "m") {
            timeMs += time * 60000;
          } else if (subChar === "h") {
            timeMs += time * 60000 * 60;
          } else if (subChar === "w") {
            timeMs += time * 24 * 7 * 60000 * 60;
          } else if (subChar === "d") {
            timeMs += time * 24 * 60000 * 60;
          } else if (subChar === "s") {
            timeMs += time * 1000;
          }
          iter += timeStr.length;
          break;
        }
        subIter++;
      }
    }
  }

  return timeMs;
};

const TimeTrack = (props: {
  task: Task;
  onTaskUpdated: (task: Task) => void;
}) => {
  const [trackTime, setTrackTime] = useState<string>("");
  const [estimateTime, setEstimateTime] = useState<string>("");
  const [timeProgress, setTimeProgress] = useState<number>(0);
  useEffect(() => {
    if (props.task?.timeEstimate) {
      const prog = Math.min(
        ((props.task.timeElapsed ? props.task.timeElapsed : 1) /
          props.task.timeEstimate) *
          100,
        100
      );
      setTimeProgress(prog);
    }
  }, [props.task]);

  if (props.task === null) {
    return <></>;
  }

  const getTimeLeft = () => {
    if (props.task.timeEstimate && props.task.timeElapsed) {
      return readableTime(props.task.timeEstimate + 1 - props.task.timeElapsed);
    }

    return "0";
  };

  const readableTime = (time: number) => {
    const minutes = Math.floor(time / 60000) % 60;
    const hours = Math.floor((time / (1000 * 60 * 60)) % 24);
    const days = Math.floor((time / (24 * (1000 * 60 * 60))) % 7);
    const weeks = Math.floor(time / (24 * 7 * 60000 * 60));

    const formatArray = [`${weeks}w`, `${days}d`, `${hours}h`, `${minutes}m`];
    const timeOut = [];
    if (weeks > 0) timeOut.push(formatArray[0]);
    if (days > 0) timeOut.push(formatArray[1]);
    if (hours > 0) timeOut.push(formatArray[2]);
    if (minutes > 0) timeOut.push(formatArray[3]);

    return timeOut.join(" ");
  };

  const getEstimatedDuration = () => {
    if (props.task.timeEstimate && props.task.timeElapsed) {
      return readableTime(props.task.timeEstimate ?? 1);
    }

    return "0";
  };

  const updateTime = () => {
    if (props.task.timeEstimate) {
      if (trackTime) {
        const addedTime = validateInput(trackTime);
        const newProgressPercent =
          (props.task.timeElapsed ? props.task.timeElapsed : 1) + addedTime;
        const newProgress =
          (props.task.timeElapsed ? props.task.timeElapsed : 1) + addedTime;
        const progress = Math.min(
          (newProgressPercent / props.task.timeEstimate) * 100,
          100
        );
        setTimeProgress(progress);
        setTrackTime("");
        props.onTaskUpdated({ ...props.task, timeElapsed: newProgress });
      }
    }

    if (estimateTime) {
      const timeEstimate = validateInput(estimateTime);
      props.onTaskUpdated({
        ...props.task,
        timeEstimate: timeEstimate,
        timeElapsed: props.task.timeElapsed ? props.task.timeElapsed : 1,
      });
      setEstimateTime("");
    }
  };

  return (
    <div>
      <Switch
        my={8}
        label="Track time"
        checked={props.task.timeTrack ? true : false}
        onClick={(e) =>
          props.onTaskUpdated({
            ...props.task,
            timeTrack: e.currentTarget.checked ? 1 : 0,
          })
        }
      />
      {props.task.timeTrack === 1 && (
        <Box>
          <Tooltip label="Format: 1h 20m 15s">
            <TextInput
              placeholder="Estimated duration"
              label="Estimated duration"
              value={estimateTime}
              onChange={(e) =>
                setEstimateTime(parseTimeInput(trackTime ?? "", e.target.value))
              }
            />
          </Tooltip>
          <Text>Estimated duration {getEstimatedDuration()}</Text>
          <Divider my="md" />
          <Box>
            <Progress size="lg" striped value={timeProgress} />
            <Text>Time left {getTimeLeft()}</Text>
            <Tooltip label="Format: 1w 6d 20m 1h 15s">
              <TextInput
                placeholder="Add time"
                label="Add time"
                value={trackTime}
                onChange={(e) =>
                  setTrackTime(parseTimeInput(trackTime ?? "", e.target.value))
                }
              />
            </Tooltip>
            <Group position="right" my={8}>
              <Button
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  updateTime();
                }}
              >
                Update time
              </Button>
            </Group>
          </Box>
        </Box>
      )}
    </div>
  );
};

export default TimeTrack;
