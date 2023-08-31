"use client"
import React, { useEffect, useState, useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./../../globals.css";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { ToastOptions, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { toastProperties } from "../../types/global";

const CreateTaskList = ({}) => {
  const [tasklist, setTaskList] = useState();
  const [newlist, setNewList] = useState({ name: "", description: "" });

  const createTaskList = async () => {
    await fetch("/api/fetch/Tasklist/CreateTaskList", {
      method: "POST",
      body: JSON.stringify({
        Name: newlist?.name,
        Description: newlist?.description,
      })
    })
      .then(() => {
        toast("Created new tasklist: " + newlist?.name, toastProperties);
        setNewList({ name: "", description: "" });
      })
      .catch((err) => {
        console.log(err.message);
      });
    //const data = await response.json();
    //this.setState({ forecasts: data, loading: false });
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
            value={newlist.name}
            onChange={(event) => {
              const data = {
                name: event.target.value,
                description: newlist.description,
              };
              setNewList(data);
            }}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formDescription">
          <Form.Label>Description</Form.Label>
          <Form.Control
            type="textarea"
            placeholder="Description"
            value={newlist.description}
            onChange={(event) => {
              const data = {
                name: newlist.name,
                description: event.target.value,
              };
              setNewList(data);
            }}
          />
        </Form.Group>
        <Button variant="primary" type="button" onClick={createTaskList}>
          Create new tasklist
        </Button>
      </Form>
    </div>
  );
};

export default CreateTaskList;
