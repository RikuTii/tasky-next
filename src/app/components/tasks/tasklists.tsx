"use client"
import React, { useEffect, useState, useContext } from "react";
import { Box, Button, Grid, Group, Modal, Table } from "@mantine/core";
import { Tasklist } from "../../types/tasks";
import { useSession } from "next-auth/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShareNodes, faTrash, faXmark } from "@fortawesome/free-solid-svg-icons";
import { notifications } from "@mantine/notifications";
import {useDisclosure} from "@mantine/hooks"


const TaskLists = ({}) => {
  const { data: session, status } = useSession();
  const [tasklists, setTaskLists] = useState<Tasklist[] | null>(null);
  const [shareList, setShareList] = useState<Tasklist | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [shareEmail, setShareEmail] = useState<string>("");

  const loadTaskLists = async () => {
    const response = await fetch("/api/fetch/tasklist/Index");
    const data = await response.json();
    setTaskLists(data);

    if (shareList) {
      data.forEach((list: Tasklist) => {
        if (list.id == shareList.id) {
          setShareList(list);
        }
      });
    }
  };

  const shareTaskList = async () => {
    fetch("/api/fetch/tasklist/ShareTaskList", {
      method: "POST",
      body: JSON.stringify({
        id: shareList?.id,
        email: shareEmail,
      }),
    })
      .then(() => {
        loadTaskLists();
        notifications.show({
          title: "Tasklist shared",
          message: "Tasklist shared to " + shareEmail,
        });
      })
      .catch((err) => {
        console.log(err.message);
      });
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

  useEffect(() => {
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
    <div>
      <h1>Manage tasklists</h1>
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
          {tasklists.map((tasklist) => (
            <tr key={tasklist.id}>
              <td className="text-light">{tasklist.name}</td>
              <td className="text-light">{tasklist.createdDate}</td>
              <td className="text-light">
                {tasklist.creator ? tasklist.creator.firstName : 0}
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
                      <FontAwesomeIcon
                        icon={faShareNodes}
                        size="2xl"
                      />
                    )}
                </div>
              </td>
              <td>
                <div
                  style={{ alignContent: "center", justifyContent: "center" }}
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
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal opened={opened} onClose={close} centered title="Share tasklist">
        <Box sx={(theme) => ({
          backgroundColor: theme.colors.dark[6]
        })}>
          <h3>Shared users</h3>
          <div>
            <p>{shareList?.name}</p>
            {shareList &&
              shareList.taskListMetas &&
              shareList?.taskListMetas.map((meta: any) => {
                return (
                  <Grid key={meta.userAccount.email}>
                    <Grid.Col>
                      <span style={{ fontWeight: "bold" }}>
                        {meta.userAccount.firstName}
                      </span>{" "}
                      <span>{meta.userAccount.email}</span>
                    </Grid.Col>

                    <Grid.Col>
                      <div
                        onClick={() => {
                          removeTaskListShare(meta.userAccount.email);
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faXmark}
                          color="black"
                          size="2x"
                        />
                      </div>
                    </Grid.Col>
                  </Grid>
                );
              })}
          </div>
          <Grid>
            <Grid.Col>
              <p>Email</p>
              <input
                type="email"
                value={shareEmail}
                onChange={(event) => {
                  setShareEmail(event.target.value);
                }}
              ></input>
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
            </Grid.Col>
          </Grid>
        </Box>
        <Group position="right">
          <Button variant="outline" onClick={close}>
            Close
          </Button>
        </Group>
      </Modal>
    </div>
  );
};

export default TaskLists;
