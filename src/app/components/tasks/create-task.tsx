import { notifications } from "@mantine/notifications";
import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";


const CreateTask = ({}) => {
  const [tasklist, setTaskList] = useState();
  const [newTask, setNewTask] = useState({ name: "", description: "", listId: 0 });

  useEffect(() => {

  }, []);

  const loadTaskLists = async () => {
    const response = await fetch("api/fetch/tasks/TaskList");
    const data = await response.json();
    console.log(data);
    //  this.setState({ tasklist: data.Result, loading: false });
  };

  const createNewTask = async () => {
    fetch("api/fetch/tasks/CreateTask", {
      method: "POST",
      body: JSON.stringify({
        Name: newTask?.name,
        Description: newTask?.description,
        Id: newTask?.listId,
      })
    })
      .then(() => {
        notifications.show({
          title: "Task created",
          message: newTask?.name,
        });
        setNewTask({ name: "", description: "", listId: 0 });
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  return (
    <div>
      <h1>Create new tasklist</h1>
      <Form>
        <Form.Group className="mb-3" controlId="formName">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Name"
            value={newTask.name}
            onChange={(event) => {
              const data = {
                name: event.target.value,
                description: newTask.description,
                listId: newTask.listId
              };
              setNewTask(data);
            }}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formDescription">
          <Form.Label>Description</Form.Label>
          <Form.Control
            type="textarea"
            placeholder="Description"
            value={newTask.description}
            onChange={(event) => {
              const data = {
                name: newTask.name,
                description: event.target.value,
                listId: newTask.listId
              };
              setNewTask(data);
            }}
          />
        </Form.Group>
        <Button variant="primary" type="button" onClick={createNewTask}>
          Create new task
        </Button>
      </Form>
    </div>
  );
};

export default CreateTask;
