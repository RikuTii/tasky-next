import { notifications } from "@mantine/notifications";
import React, { useEffect, useState } from "react";

const CreateTask = ({}) => {
  const [tasklist, setTaskList] = useState();
  const [newTask, setNewTask] = useState({ name: "", description: "", listId: 0 });


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

    </div>
  );
};

export default CreateTask;
