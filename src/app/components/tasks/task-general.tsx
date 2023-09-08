import { Task, TaskMeta } from "@/types/tasks";
import { File as TaskyFile } from "@/types/tasks";
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
  FileInput,
  Modal,
  BackgroundImage,
  rem,
  UnstyledButton,
  CloseButton,
} from "@mantine/core";
import { useState } from "react";
import { DateTimePicker } from "@mantine/dates";
import { useDisclosure, useHover } from "@mantine/hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const TaskGeneral = (props: {
  task: Task;
  onTaskUpdated: (task: Task) => void;
  onFilesAdded: (files: File[]) => void;
  attachments: File[];
}) => {
  const [showFileInput, setShowFileInput] = useState(false);
  const [showFile, setShowFile] = useState<TaskyFile | null>(null);
  const [opened, { open, close }] = useDisclosure(false, {
    onClose: () => setShowFile(null),
  });
  const { hovered, ref } = useHover();

  const getAttachmentPath = (file: TaskyFile) => {
    if (file.path?.substring(0, 4) === "http") {
      return file.path;
    }
    if (process.env.NEXT_PUBLIC_ASSET_URL && file.path) {
      return process.env.NEXT_PUBLIC_ASSET_URL + file.path;
    }

    return "";
  };

  return (
    <div>
      <TextInput
        placeholder=""
        label="Name"
        value={props.task.title}
        onChange={(event) => {
          const newTask = { ...props.task, title: event.target.value };
          props.onTaskUpdated(newTask);
        }}
      />

      <Textarea
        placeholder="Description"
        label="Description"
        value={props.task.description ?? ""}
        onChange={(event) => {
          const newTask = { ...props.task, description: event.target.value };
          props.onTaskUpdated(newTask);
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
          accept="image/png,image/jpeg,image/gif,application/json,application/pdf,text/plain"
          multiple
          value={props.attachments}
          onChange={props.onFilesAdded}
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
          {props.task.meta?.length}{" "}
          {props.task.meta && props.task.meta.length !== 1
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

      <ScrollArea>
        <Flex direction={"row"} ref={ref}>
          {props.task.meta?.map((meta: TaskMeta) => {
            return (
              <Box
                key={meta.file?.path}
                miw={140}
                mih={125}
                mx={5}
                mt={8}
                onClick={() => {
                  if (meta.file?.type === "image") {
                    setShowFile(meta.file ?? null);
                    open();
                  }
                }}
              >
                {meta.file?.type === "image" ? (
                  <BackgroundImage
                    src={getAttachmentPath(meta.file)}
                    radius="md"
                  >
                    <Box
                      key={meta.file?.path}
                      miw={140}
                      mih={110}
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "flex-end",
                      }}
                    >
                      <Box
                        sx={{
                          alignSelf: "flex-start",
                          opacity: hovered ? "1" : "0.0",
                          marginRight: 10,
                          transition: "opacity 0.2s ease-out",
                        }}
                      >
                        <CloseButton
                          title="Delete attachment"
                          size="sm"
                          color="red"
                          variant="filled"
                        />
                      </Box>
                      <Box
                        miw={"100%"}
                        maw={100}
                        sx={{
                          backgroundColor: "black",
                          height: 20,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Text
                          pl={rem(4)}
                          sx={{
                            textOverflow: "clip",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {meta.file?.name}
                        </Text>
                      </Box>
                    </Box>
                  </BackgroundImage>
                ) : (
                  <Box
                    key={meta.file?.path}
                    miw={140}
                    mih={110}
                    sx={(theme) => ({
                      display: "block",
                      backgroundColor: theme.colors.dark[4],
                    })}
                  >
                    <Box
                      mih={90}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text sx={{ whiteSpace: "nowrap", textAlign: "center" }}>
                        No preview
                      </Text>
                    </Box>

                    <Box
                      component="a"
                      href={meta.file ? getAttachmentPath(meta.file) : ""}
                      download={meta.file?.name}
                      miw={"100%"}
                      maw={140}
                      sx={{
                        backgroundColor: "black",
                        height: 20,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        sx={{
                          textOverflow: "clip",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                        }}
                        pl={rem(4)}
                      >
                        {meta.file?.name}
                      </Text>
                    </Box>
                  </Box>
                )}
              </Box>
            );
          })}
        </Flex>
      </ScrollArea>

      <Modal opened={opened} size="lg" onClose={close}>
        {showFile && (
          <Image src={getAttachmentPath(showFile)} radius="md" fit="contain" />
        )}
      </Modal>
      <Modal opened={opened} size="lg" onClose={close}>
        {showFile && (
          <Image src={getAttachmentPath(showFile)} radius="md" fit="contain" />
        )}
      </Modal>
    </div>
  );
};

export default TaskGeneral;
