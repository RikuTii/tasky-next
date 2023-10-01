"use client";
import React, { useState } from "react";
import "./../../globals.css";
import { useForm } from "@mantine/form";
import {
  Box,
  Group,
  TextInput,
  Button,
  Title,
  Container,
  Center,
} from "@mantine/core";
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
    const res = await fetch("/api/fetch/tasklist/CreateTaskList", {
      method: "POST",
      body: JSON.stringify({
        Name: values.name,
        Description: values.description,
      }),
    });
    if (!res.ok) {
      notifications.show({
        title: "Error occured",
        message: "Error creating tasklist",
        color: "red",
      });
    } else {
      notifications.show({
        title: "Tasklist created",
        message: values.name,
      });
      form.reset();
    }
  };

  return (
    <Container w={450} mx="auto">
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
    </Container>
  );
};

export default CreateTaskList;
