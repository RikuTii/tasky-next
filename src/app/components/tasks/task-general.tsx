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
  CloseButton,
  createStyles,
  useMantineTheme,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { DateTimePicker } from "@mantine/dates";
import { useDisclosure, useFocusReturn, useFocusTrap, useFocusWithin, useHover, useMediaQuery } from "@mantine/hooks";
import { useSession } from "next-auth/react";
import { retrieveToken } from "@/helpers/fcmtoken";

const useStyles = createStyles((theme) => ({
  attchDisplay: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  attchNoContent: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  attchDisplayContainer: {
    display: "flex",
    justifyContent: "flex-end",
    transition: "opacity 0.2s ease-out",
  },
  attchDesc: {
    backgroundColor: "black",
    height: 20,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  attchText: {
    textOverflow: "clip",
    overflow: "hidden",
    whiteSpace: "nowrap",
  },
}));

const TaskGeneral = (props: {
  task: Task;
  onTaskUpdated: (task: Task) => void;
  onFilesAdded: (files: File[]) => void;
  onFileRemove: (taskMeta: TaskMeta) => void;
  onScheduleChange: (date: string) => void;
  attachments: File[];
}) => {
  const [showFileInput, setShowFileInput] = useState(false);
  const [showFile, setShowFile] = useState<TaskyFile | null>(null);
  const [scheduleDate, setScheduleDate] = useState<Date | null>(null);
  const { data, update } = useSession();
  const { classes } = useStyles();
  const [opened, { open, close }] = useDisclosure(false, {
    onClose: () => setShowFile(null),
  });
  const { hovered, ref } = useHover();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm}`);


  useEffect(() => {
    if (props.task.scheduleDate && scheduleDate === null) {
      const d = new Date(props.task.scheduleDate);
      const dtOffset = new Date(
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
      );
      setScheduleDate(dtOffset);
    }
  }, [props.task]);

  useEffect(() => {
    if (scheduleDate) {
      props.onScheduleChange(scheduleDate.toISOString());
    }
  }, [scheduleDate]);

  const getAttachmentPath = (file: TaskyFile) => {
    if (file.path?.substring(0, 4) === "http") {
      return file.path;
    }
    if (process.env.NEXT_PUBLIC_ASSET_URL && file.path) {
      return process.env.NEXT_PUBLIC_ASSET_URL + file.path;
    }

    return "";
  };

  const askNotificationPermission = async () => {
    if (data?.user?.fcmToken === "pending") {
      const token = await retrieveToken();
      if (token !== "") {
        update({ fcmToken: token });
        fetch("/api/fetch/UpdateDevice", {
          method: "POST",
          body: JSON.stringify({
            fcmToken: token,
          }),
        });
      }
    }
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
        onClick={askNotificationPermission}
        value={scheduleDate}
        onChange={(e) => setScheduleDate(e)}
        clearable
        locale="fi-FI"
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
              <Box key={meta.file?.path} miw={140} mih={125} mx={5} mt={8}>
                {meta.file?.type === "image" ? (
                  <BackgroundImage
                    src={getAttachmentPath(meta.file)}
                    radius="md"
                    onClick={() => {
                      if (meta.file?.type === "image") {
                        setShowFile(meta.file ?? null);
                        open();
                      }
                    }}
                  >
                    <Box
                      h={0}
                      className={classes.attchDisplayContainer}
                      sx={{
                        opacity: (hovered || isMobile) ? "1" : "0.0",
                      }}
                    >
                      <CloseButton
                        title="Delete attachment"
                        size="sm"
                        color="red"
                        variant="filled"
                        onClick={(e) => {
                          if(hovered || isMobile) {
                            e.preventDefault();
                            e.stopPropagation();
                            props.onFileRemove(meta);
                          }                  
                        }}
                      />
                    </Box>
                    <Box
                      key={meta.file?.path}
                      miw={140}
                      mih={110}
                      className={classes.attchDisplay}
                    >
                      <Box miw={"100%"} maw={100} className={classes.attchDesc}>
                        <Text pl={rem(4)} className={classes.attchText}>
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
                      h={0}
                      className={classes.attchDisplayContainer}
                      sx={{
                        opacity: hovered ? "1" : "0.0",
                      }}
                    >
                      <CloseButton
                        title="Delete attachment"
                        size="sm"
                        color="red"
                        variant="filled"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          props.onFileRemove(meta);
                        }}
                      />
                    </Box>
                    <Box mih={90} className={classes.attchNoContent}>
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
                      className={classes.attchDesc}
                    >
                      <Text className={classes.attchText} pl={rem(4)}>
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

      <Modal opened={opened} size="auto" onClose={close}>
        {showFile && <Image src={getAttachmentPath(showFile)} radius="md" />}
      </Modal>
    </div>
  );
};

export default TaskGeneral;
