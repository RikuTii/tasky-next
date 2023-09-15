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
  const [shareList, setShareList] = useState<Tasklist | null>(null);
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
    if (shareList) {
      data.forEach((list: Tasklist) => {
        if (list.id == shareList.id) {
          setShareList(list);
        }
      });
    }
  };

  const shareTaskList = async () => {
    const response = await fetch("/api/fetch/tasklist/ShareTaskList", {
      method: "POST",
      body: JSON.stringify({
        id: shareList?.id,
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
    fetch("/api/fetch/tasklist/RemoveShareTaskList", {
      method: "POST",
      body: JSON.stringify({
        id: shareList?.id,
        email: email,
      }),
    })
      .then(() => {
        loadTaskLists();
        notifications.show({
          title: "Tasklist sharing removed",
          message: "Sharing to " + email + " removed",
        });
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  const deleteTasklist = async (id: number | undefined) => {
    if (id === undefined) return;

    fetch("/api/fetch/tasklist/Delete", {
      method: "POST",
      body: JSON.stringify({
        id: id,
      }),
    })
      .then(() => {
        loadTaskLists();
        notifications.show({
          title: "Delete tasklist",
          message: "Tasklist has been deleted",
        });
      })
      .catch((err) => {
        console.log(err.message);
      });
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
      <Container size="md">
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
                <td className="text-light">{tasklist.name}</td>
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
                      setShareList(tasklist);
                      open();
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

        <Modal opened={opened} onClose={close} centered title="Share tasklist">
          <Box
            sx={(theme) => ({
              backgroundColor: theme.colors.dark[6],
              padding: rem(8),
            })}
          >
            <Box>
              <Title order={3}>{shareList?.name}</Title>
              <Divider size="md" my="xs"></Divider>
              {shareList &&
                shareList.taskListMetas &&
                shareList?.taskListMetas.map((meta: TaskListMeta) => {
                  return (
                    <Grid key={meta.userAccount.id}>
                      <Grid.Col span={4}>
                        <Text fw={700}>{meta.userAccount.username}</Text>{" "}
                      </Grid.Col>
                      <Grid.Col span={4}>
                        <Text>{meta.userAccount.email}</Text>
                      </Grid.Col>
                      <Grid.Col span={2}>
                        <CloseButton
                          size="md"
                          onClick={() => {
                            removeTaskListShare(meta.userAccount.email);
                          }}
                        ></CloseButton>
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
                  value={shareEmail}
                  onChange={(event) => {
                    setShareEmail(event.target.value);
                  }}
                />
              </Grid.Col>
              <Grid.Col>
                <Group position="right">
                  <Button
                    sx={{ marginLeft: 8 }}
                    variant="outline"
                    onClick={() => {
                      setShareEmail("");
                      shareTaskList();
                    }}
                  >
                    Share
                  </Button>
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
