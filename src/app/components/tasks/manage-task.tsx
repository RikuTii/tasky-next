import { File, Task, TaskMeta } from "@/types/tasks";
import {
  Box,
  Button,
  Flex,
  Group,
  TextInput,
  Textarea,
  Text,
  Image,
  ScrollArea,
  Title,
  FileInput,
  Modal,
  Switch,
  Progress,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { DateTimePicker } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";

const parseTimeInput = (oldinput: string, input: string) => {
  return input.match("^[0-9mhwds ]*$")?.join("") ?? oldinput;
};

const validateInput = (input: string) => {
  let iter = 0;
  let timeMs = 0;
  for (iter; iter < input.length; iter++) {
    const char = input.at(iter);
    if (!char) continue;
    let subIter = 1;
    if (char.match("^[0-9]*$")) {
      for (; subIter < input.length; ) {
        const subChar = input.at(iter + subIter);
        if (!subChar) continue;
        if (subChar.match("^[mhwds]*$")) {
          const time = input.substring(iter, iter + subIter);
          if (subChar === "m") {
            timeMs = Number(time) * 60000;
          } else if (subChar === "h") {
            timeMs = Number(time) * 60000 * 60;
          } else if (subChar === "w") {
            timeMs = Number(time) * 24 * 7 * 60000 * 60;
          } else if (subChar === "d") {
            timeMs = Number(time) * 24 * 60000 * 60;
          } else if (subChar === "s") {
            timeMs = Number(time) * 1000;
          }
          iter += time.length + 1;
          break;
        }
        subIter++;
      }
    }
  }
};

const ManageTask = (props: {
  task: Task | null;
  onTaskUpdated: (task: Task) => void;
}) => {
  const [localTask, setLocalTask] = useState<Task | null>(null);
  const [showFileInput, setShowFileInput] = useState(false);
  const [showFile, setShowFile] = useState<File | null>(null);
  const [trackTime, setTrackTime] = useState<string>();

  const [opened, { open, close }] = useDisclosure(false, {
    onClose: () => setShowFile(null),
  });
  useEffect(() => {
    setLocalTask(props.task);
    console.log(props.task);
  }, [props.task]);

  const addAttachment = async (task: Task) => {
    fetch("/api/fetch/task/AddAttachment", {
      method: "POST",
      body: JSON.stringify({
        id: task?.id,
      }),
    })
      .then(() => {
        props.onTaskUpdated(task);
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  if (localTask === null) {
    return <></>;
  }

  const getTimeLeft = () => {
    if (localTask.timeEstimate && localTask.timeElapsed) {
      const timeEnd = new Date(localTask.timeEstimate).getTime();
      const timeNow = new Date(localTask.timeElapsed).getTime();
      const diff = new Date(timeEnd - timeNow);
      const format = diff.toISOString().split("T")[1].substring(0, 8);
      return format;
    }

    return "0";
  };

  return (
    <div>
      <Title order={3}>{props.task?.title}</Title>
      <div>
        <TextInput
          placeholder=""
          label="Name"
          value={localTask.title}
          onChange={(event) => {
            const newTask = { ...props.task, title: event.target.value };
            setLocalTask(newTask);
          }}
        />

        <Textarea
          placeholder="Description"
          label="Description"
          onChange={(event) => {
            const newTask = { ...props.task, description: event.target.value };
            setLocalTask(newTask);
          }}
        />
        <DateTimePicker
          clearable
          defaultValue={new Date()}
          label="Schedule task"
          placeholder="Pick date and time"
          size="sm"
          dropdownType="modal"
          mx="auto"
        />

        {showFileInput && (
          <FileInput
            label="Upload attachments"
            placeholder="Select files"
            multiple
          />
        )}
        <Flex
          mt={8}
          mb={8}
          direction={"row"}
          justify={"space-between"}
          align={"center"}
        >
          <Text>
            {localTask.meta?.length}{" "}
            {localTask.meta && localTask.meta.length !== 1
              ? "attachments"
              : "attachment"}
          </Text>
          <Group position="right">
            <Button
              size="sm"
              variant="subtle"
              onClick={(e) => setShowFileInput(!showFileInput)}
            >
              Add
            </Button>
          </Group>
        </Flex>
        <ScrollArea w={250}>
          <Flex direction={"row"}>
            {localTask.meta?.map((meta: TaskMeta) => {
              return (
                <Box
                  key={meta.file?.path}
                  maw={140}
                  mah={140}
                  miw={120}
                  mih={120}
                  mx={5}
                  mt={8}
                  onClick={() => {
                    setShowFile(meta.file ?? null);
                    open();
                  }}
                >
                  <Image src={meta.file?.path} radius="md" fit="contain" />
                  <Box sx={{ position: "relative" }}>
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 0,
                      }}
                    >
                      <Box
                        miw={"100%"}
                        sx={{ backgroundColor: "black", height: 20 }}
                      >
                        <Text>{meta.file?.name}</Text>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Flex>
        </ScrollArea>

        <Switch
          my={8}
          label="Track time"
          checked={localTask.timeTrack ? true : false}
          onClick={(e) =>
            setLocalTask({
              ...localTask,
              timeTrack: e.currentTarget.checked ? 1 : 0,
            })
          }
        />

        {localTask.timeTrack === 1 && (
          <Box>
            <Progress
              size="xl"
              sections={[
                { value: 40, color: "cyan" },
                { value: 20, color: "blue" },
                { value: 15, color: "indigo" },
              ]}
            />
            <Text>Time left {getTimeLeft()}</Text>
            <TextInput
              placeholder="Add time"
              label="Add time"
              value={trackTime}
              onSubmit={(e) => validateInput(trackTime ?? "")}
              onChange={(e) =>
                setTrackTime(parseTimeInput(trackTime ?? "", e.target.value))
              }
            />

            <Group position="right" my={8}>
              <Button
                variant="filled"
                onClick={(e) => {
                  e.preventDefault();
                  validateInput(trackTime ?? "");
                }}
              >
                Validate
              </Button>
            </Group>
          </Box>
        )}

        <Group position="right" my={8}>
          <Button
            variant="filled"
            onClick={() => props.onTaskUpdated(localTask)}
          >
            Save changes
          </Button>
        </Group>
      </div>

      <Modal opened={opened} size="lg" onClose={close}>
        {showFile && <Image src={showFile.path} radius="md" fit="contain" />}
      </Modal>
    </div>
  );
};

export default ManageTask;
