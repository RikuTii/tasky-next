"use client";
import React, { useEffect, useState } from "react";
import "@/globals.css";
import { useForm } from "@mantine/form";
import {
  Box,
  Group,
  TextInput,
  Button,
  Center,
  Loader,
  Title,
  Container,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import { useStyles } from "./tasks/sortable-tasklist";

interface ProfileForm {
  firstName: string;
  lastName: string;
  avatar: string;
  locale: string;
  email: string;
}

const Profile = ({}) => {
  const [loading, { toggle, open, close }] = useDisclosure(true);
  const form = useForm<ProfileForm>({
    initialValues: {
      firstName: "",
      lastName: "",
      avatar: "",
      locale: "",
      email: "",
    },
    validate: {
      firstName: (value) =>
        value.length < 2 ? "Name must have at least 2 letters" : null,
    },
  });
  const { classes } = useStyles();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const response = await fetch("/api/fetch/profile/profile");
    if (response.ok) {
      const data = await response.json();
      form.setValues(data);
      close();
    }
  };

  const updateProfile = async (values: ProfileForm) => {
    open();
    const res = await fetch("/api/fetch/profile/update", {
      method: "POST",
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      notifications.show({
        title: "Error occured",
        message: "Error updating profile",
        color: "red",
      });
    } else {
      notifications.show({
        title: "Profile updated",
        message: "Successfully updated profile",
      });
      loadProfile();
    }
  };

  if (loading) {
    return (
      <Center maw={400} h={100} mx="auto">
        <Loader />
      </Center>
    );
  }

  return (
    <Container fluid w={450} mx="auto">
      <Title order={2}>Update profile information</Title>
      <Box maw={600} mx="auto">
        <form onSubmit={form.onSubmit((values) => updateProfile(values))}>
          <TextInput
            sx={{ marginBottom: 8 }}
            label="First name"
            placeholder=""
            classNames={{input: classes.defaultInput}}
            {...form.getInputProps("firstName")}
          />
          <TextInput
            sx={{ marginBottom: 8 }}
            label="Last name"
            placeholder=""
            classNames={{input: classes.defaultInput}}
            {...form.getInputProps("lastName")}
          />
          <TextInput
            sx={{ marginBottom: 8 }}
            label="Email"
            placeholder=""
            classNames={{input: classes.defaultInput}}
            {...form.getInputProps("email")}
          />
          <Group position="right" mt="md">
            <Button type="submit">Update</Button>
          </Group>
        </form>
      </Box>
    </Container>
  );
};

export default Profile;
