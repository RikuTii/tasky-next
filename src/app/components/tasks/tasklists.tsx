import React, { useEffect, useState, useContext } from "react";
import { ToastOptions, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Table } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { Col, Container, Row } from "react-bootstrap";
import { toastProperties } from "../../types/global";
import { Tasklist } from "../../types/tasks";
import "../Styles/Styles.css";
import { useSession } from "next-auth/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const TaskLists = ({}) => {
  const { data: session, status } = useSession();
  const [tasklists, setTaskLists] = useState<Tasklist[] | null>(null);
  const [shareList, setShareList] = useState<Tasklist | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState<string>("");

  const loadTaskLists = async () => {
    const response = await fetch("api/fetch/tasklist/Index");
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
    fetch("api/fetch/tasklist/ShareTaskList", {
      method: "POST",
      body: JSON.stringify({
        id: shareList?.id,
        email: shareEmail,
      }),
    })
      .then(() => {
        loadTaskLists();
        toast("Shared list to " + shareEmail, toastProperties);
      })
      .catch((err) => {
        console.log(err.message);
      });
  };
  const removeTaskListShare = async (email: string) => {
    fetch("api/fetch/tasklist/RemoveShareTaskList", {
      method: "POST",
      body: JSON.stringify({
        id: shareList?.id,
        email: email,
      }),
    })
      .then(() => {
        loadTaskLists();
        toast("Removed sharing from " + email, toastProperties);
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  const handleClose = () => {
    setShowShareModal(false);
    loadTaskLists();
  };
  const handleOpen = () => setShowShareModal(true);

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
      <Table striped bordered hover>
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
                    handleOpen();
                  }}
                >
                  {tasklist.creator &&
                    tasklist.creator.id == session?.user?.id && (
                      <FontAwesomeIcon
                        icon={["fas", "share-nodes"]}
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
                        icon={["fas", "trash"]}
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

      <Modal show={showShareModal} onHide={handleClose}>
        <Modal.Header closeButton className="primary-background">
          <Modal.Title>Share tasklist</Modal.Title>
        </Modal.Header>
        <Modal.Body className="primary-background">
          <h3>Shared users</h3>
          <div>
            <p>{shareList?.name}</p>
            {shareList &&
              shareList.taskListMetas &&
              shareList?.taskListMetas.map((meta: any) => {
                return (
                  <Row key={meta.userAccount.email}>
                    <Col>
                      <span style={{ fontWeight: "bold" }}>
                        {meta.userAccount.firstName}
                      </span>{" "}
                      <span>{meta.userAccount.email}</span>
                    </Col>

                    <Col>
                      <div
                        onClick={() => {
                          removeTaskListShare(meta.userAccount.email);
                        }}
                      >
                        <FontAwesomeIcon
                          icon={["fas", "xmark"]}
                          color="black"
                          size="2x"
                        />
                      </div>
                    </Col>
                  </Row>
                );
              })}
          </div>
          <Row>
            <Col>
              <p>Email</p>
              <input
                type="email"
                value={shareEmail}
                onChange={(event) => {
                  setShareEmail(event.target.value);
                }}
              ></input>
              <Button
                style={{ marginLeft: 8 }}
                variant="primary"
                onClick={() => {
                  setShareEmail("");
                  shareTaskList();
                }}
              >
                Share
              </Button>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="primary-background">
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TaskLists;
