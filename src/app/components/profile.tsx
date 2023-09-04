"use client";
import React, { useEffect, useState } from "react";
import "@/globals.css";
import { useForm } from "@mantine/form";
import { Box, Group, TextInput, Button, Center, Loader } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { method } from "lodash";
import { useDisclosure } from "@mantine/hooks";

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

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const response = await fetch("/api/fetch/profile/profile");
    const data = await response.json();
    form.setValues(data);
    close();
  };

  const updateProfile = async (values: ProfileForm) => {
    open();
    await fetch("/api/fetch/profile/update", {
      method: "POST",
      body: JSON.stringify(values),
    })
      .then(() => {
        notifications.show({
          title: "Profile updated",
          message: "Successfully updated profile",
        });
        loadProfile();
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  if (loading) {
    return (
      <Center maw={400} h={100} mx="auto">
        <Loader />
      </Center>
    );
  }

  return (
    <div>
      <h1>Update profile information</h1>
      <Box maw={340} mx="auto">
        <form onSubmit={form.onSubmit((values) => updateProfile(values))}>
          <TextInput
            sx={{ marginBottom: 8 }}
            label="First name"
            placeholder=""
            {...form.getInputProps("firstName")}
          />
          <TextInput
            sx={{ marginBottom: 8 }}
            label="Last name"
            placeholder=""
            {...form.getInputProps("lastName")}
          />
          <TextInput
            sx={{ marginBottom: 8 }}
            label="Email"
            placeholder=""
            {...form.getInputProps("email")}
          />
          <Group position="right" mt="md">
            <Button type="submit">Update</Button>
          </Group>
        </form>
      </Box>
    </div>
  );
};

export default Profile;
