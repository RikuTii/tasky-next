"use client";
import React, { useState } from "react";
import "./../../globals.css";
import { useForm } from "@mantine/form";
import { Box, Group, TextInput, Button, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";

interface TaskForm {
  name: string;
  description: string;
}

const CreateTaskList = ({}) => {
  const form = useForm<TaskForm>({
    initialValues: { name: "", description: "" },
    validate: {
      name: (value) =>
        value.length < 2 ? "Name must have at least 2 letters" : null,
    },
  });

  const createTaskList = async (values: TaskForm) => {
    await fetch("/api/fetch/tasklist/CreateTaskList", {
      method: "POST",
      body: JSON.stringify({
        Name: values.name,
        Description: values.description,
      }),
    })
      .then(() => {
        notifications.show({
          title: "Tasklist created",
          message: values.name + "🤥",
        });
        form.reset();
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  return (
    <div>
      <Title order={2}>Create new tasklist</Title>

      <form onSubmit={form.onSubmit((values) => createTaskList(values))}>
        <TextInput
          sx={{ marginBottom: 8 }}
          label="Name"
          placeholder="Name"
          {...form.getInputProps("name")}
        />
        <TextInput
          label="Description"
          placeholder="Description"
          {...form.getInputProps("description")}
        />

        <Group position="right" mt="md">
          <Button type="submit">Submit</Button>
        </Group>
      </form>
    </div>
  );
};

export default CreateTaskList;
