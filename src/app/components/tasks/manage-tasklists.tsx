"use client";
import React, { useEffect, useState, useContext } from "react";
import {
  Box,
  Button,
  Center,
  CloseButton,
  Container,
  Divider,
  Flex,
  Grid,
  Group,
  Loader,
  Modal,
  Skeleton,
  Table,
  Text,
  TextInput,
  Textarea,
  Title,
  rem,
} from "@mantine/core";
import { TaskListMeta, Tasklist } from "../../types/tasks";
import { useSession } from "next-auth/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShareNodes,
  faTrash,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import { formatDate } from "@/helpers/timedateformat";

const TaskLists = ({}) => {
  const { data: session, status } = useSession();
  const [tasklists, setTaskLists] = useState<Tasklist[] | null>(null);
  const [editList, setEditList] = useState<Tasklist | null>(null);
  const [loading, setLoading] = useState(false);
  const [opened, { open, close }] = useDisclosure(false, {
    onClose: () => setShareEmail(""),
  });
  const [shareEmail, setShareEmail] = useState<string>("");

  const loadTaskLists = async () => {
    const response = await fetch("/api/fetch/tasklist/Index");
    const data = await response.json();
    setTaskLists(data);
    setLoading(false);
    if (editList) {
      data.forEach((list: Tasklist) => {
        if (list.id == editList.id) {
          setEditList(list);
        }
      });
    }
  };

  const updateTaskList = async () => {
    const response = await fetch("/api/fetch/tasklist/UpdateTaskList", {
      method: "POST",
      body: JSON.stringify({
        id: editList?.id,
        name: editList?.name,
        description: editList?.description,
      }),
    });

    if (response.ok) {
      loadTaskLists();
      notifications.show({
        title: "Tasklist updated",
        message: `${editList?.name} has been updated`,
      });
    } else {
      notifications.show({
        title: "Error occured",
        message: "Error updating tasklist",
        color: "red",
      });
    }
  };

  const shareTaskList = async () => {
    const response = await fetch("/api/fetch/tasklist/ShareTaskList", {
      method: "POST",
      body: JSON.stringify({
        id: editList?.id,
        email: shareEmail,
      }),
    });

    if (response.ok) {
      loadTaskLists();
      notifications.show({
        title: "Tasklist shared",
        message: "Tasklist shared to " + shareEmail,
      });
    } else {
      notifications.show({
        title: "Error occured",
        message: "Email is not registered to a user",
        color: "red",
      });
    }
  };
  const removeTaskListShare = async (email: string) => {
    const res = await fetch("/api/fetch/tasklist/RemoveShareTaskList", {
      method: "POST",
      body: JSON.stringify({
        id: editList?.id,
        email: email,
      }),
    });
    if (!res.ok) {
      notifications.show({
        title: "Error occured",
        message: "Error removing tasklist share",
        color: "red",
      });
    } else {
      loadTaskLists();
      notifications.show({
        title: "Tasklist sharing removed",
        message: "Sharing to " + email + " removed",
      });
    }
  };

  const deleteTasklist = async (id: number | undefined) => {
    if (id === undefined) return;

    const res = await fetch("/api/fetch/tasklist/Delete", {
      method: "POST",
      body: JSON.stringify({
        id: id,
      }),
    });
    if (!res.ok) {
      notifications.show({
        title: "Error occured",
        message: "Error deleting tasklist",
        color: "red",
      });
    } else {
      loadTaskLists();
      notifications.show({
        title: "Delete tasklist",
        message: "Tasklist has been deleted",
      });
    }
  };

  useEffect(() => {
    setLoading(true);
    loadTaskLists();
  }, []);

  if (
    tasklists === undefined ||
    tasklists === null ||
    !tasklists ||
    tasklists.length < 1
  )
    return <></>;

  return (
    <Skeleton visible={loading}>
      <Container size="md" p={rem(8)}>
        <Title order={2} mb={8}>
          Manage tasklists
        </Title>
        <Table striped highlightOnHover withBorder withColumnBorders>
          <thead>
            <tr>
              <th className="text-light">Title</th>
              <th className="text-light">Date</th>
              <th className="text-light">Creator</th>
              <th className="text-light">Share</th>
              <th className="text-light">Delete</th>
            </tr>
          </thead>
          <tbody>
            {tasklists.map((tasklist, index) => (
              <tr key={tasklist.id}>
                <td
                  className="text-light"
                  onClick={() => {
                    if (
                      tasklist.creator &&
                      tasklist.creator.id == session?.user?.id
                    ) {
                      setEditList(tasklist);
                      open();
                    }
                  }}
                >
                  {tasklist.name}
                </td>
                <td className="text-light">
                  {formatDate(tasklist.createdDate)}
                </td>
                <td className="text-light">
                  {tasklist.creator ? tasklist.creator.username : 0}
                </td>
                <td className="text-light">
                  <div
                    style={{ alignContent: "center", justifyContent: "center" }}
                    onClick={() => {
                      if (
                        tasklist.creator &&
                        tasklist.creator.id == session?.user?.id
                      ) {
                        setEditList(tasklist);
                        open();
                      }
                    }}
                  >
                    {tasklist.creator &&
                      tasklist.creator.id == session?.user?.id && (
                        <FontAwesomeIcon icon={faShareNodes} size="2xl" />
                      )}
                  </div>
                </td>
                <td>
                  {index > 0 && (
                    <div
                      style={{
                        alignContent: "center",
                        justifyContent: "center",
                      }}
                      onClick={() => deleteTasklist(tasklist.id)}
                    >
                      {tasklist.creator &&
                        tasklist.creator.id == session?.user?.id && (
                          <FontAwesomeIcon
                            icon={faTrash}
                            color="red"
                            size="2xl"
                          />
                        )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Modal opened={opened} onClose={close} centered title="Edit tasklist">
          <Box
            sx={(theme) => ({
              backgroundColor: theme.colors.dark[6],
              padding: rem(8),
            })}
          >
            <Box>
              <Title order={3}>{editList?.name}</Title>
              <Divider size="md" my="xs"></Divider>

              <TextInput
                placeholder=""
                label="Name"
                value={editList?.name}
                onChange={(event) => {
                  const newList = { ...editList, name: event.target.value };
                  setEditList(newList);
                }}
              />
              <Textarea
                placeholder="Description"
                label="Description"
                value={editList?.description}
                onChange={(event) => {
                  const newList = {
                    ...editList,
                    description: event.target.value,
                  };
                  setEditList(newList);
                }}
              />
              <Divider size="md" my="xs"></Divider>
              {editList &&
                editList.taskListMetas &&
                editList?.taskListMetas.map((meta: TaskListMeta) => {
                  return (
                    <Grid key={meta.userAccount.id}>
                      <Grid.Col
                        span={2}
                        sx={{ textOverflow: "clip", overflow: "clip" }}
                      >
                        <Flex align="center" justify="flex-start">
                          <Text fw={700}>{meta.userAccount.username}</Text>{" "}
                        </Flex>
                      </Grid.Col>
                      <Grid.Col
                        span={8}
                        sx={{ textOverflow: "clip", overflow: "clip" }}
                      >
                        <Flex align="center" justify="center">
                          <Text>{meta.userAccount.email}</Text>
                        </Flex>
                      </Grid.Col>
                      <Grid.Col span={2}>
                        <Flex align="flex-end" justify="flex-end">
                          <CloseButton
                            size="md"
                            onClick={() => {
                              removeTaskListShare(meta.userAccount.email);
                            }}
                          ></CloseButton>
                        </Flex>
                      </Grid.Col>
                    </Grid>
                  );
                })}
            </Box>
            <Grid>
              <Grid.Col>
                <Text>Email</Text>
                <TextInput
                  type="email"
                  autoCorrect=""
                  autoCapitalize="none"
                  autoComplete="none"
                  value={shareEmail}
                  onChange={(event) => {
                    setShareEmail(event.target.value);
                  }}
                />
              </Grid.Col>
              <Grid.Col>
                <Group position="right">
                  <Flex direction="column" gap={rem(28)}>
                    <Button
                      size="xs"
                      sx={{ marginLeft: 8 }}
                      variant="outline"
                      onClick={() => {
                        setShareEmail("");
                        shareTaskList();
                      }}
                    >
                      Share
                    </Button>
                    <Button
                      sx={{ marginLeft: 8 }}
                      variant="gradient"
                      onClick={() => {
                        setShareEmail("");
                        updateTaskList();
                      }}
                    >
                      Save changes
                    </Button>
                  </Flex>
                </Group>
              </Grid.Col>
            </Grid>
          </Box>
        </Modal>
      </Container>
    </Skeleton>
  );
};

export default TaskLists;
