"use client";
import "@/globals.css";
import {useState } from "react";
import { useRouter } from 'next/navigation'
import { useForm } from "@mantine/form";
import {
  Box,
  Group,
  TextInput,
  Button,
  PasswordInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

interface Registerform {
  username: string;
  email: string;
  password: string;
}

const RegisterPage = () => {
  const router = useRouter();
  const [loading, {toggle}] = useDisclosure();

  const form = useForm<Registerform>({
    initialValues: { username: "", email: "", password: "" },
    validate: {
      username: (value) =>
        value.length < 2 ? "Username must have at least 2 letters" : null,
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) =>
        value.length < 5 ? "Password must have at least 5 letters" : null,
    },
  });


  async function submitRegister(email: string | undefined, username: string | undefined, password: string | undefined) {
    const res = await fetch("http://localhost:50505/Register", {
      method: "POST",
      headers: { "Content-type": "application/json; charset=UTF-8" },

      body: JSON.stringify({
        email: email,
        username: username,
        password: password
      }),
    });

    if (!res.ok && res.status !== 400) {
      throw new Error("Unknown error occured");
    }
    const data = await res.json();

    if (res.status == 400 && data.detail === "error") {
      if(data.errors['email_taken']) {
        form.setFieldError("email", "Email is already registered");
      }
      if(data.errors['user_taken']) {
        form.setFieldError("username", "Username is already taken");
      }
    }
     else {
      toggle();
      router.push("/");
     }
  }

  const onSubmit = (values: Registerform) => {
    toggle();
    submitRegister(values.email, values.username, values.password);
  };

  return (
       <Box maw={340} mx="auto">
      <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
        <TextInput
          sx={{ marginBottom: 8 }}
          label="Username"
          placeholder="Username"
          required={true}
          {...form.getInputProps("username")}
        />
        <TextInput
          sx={{ marginBottom: 8 }}
          label="Email"
          placeholder="Email"
          required={true}
          {...form.getInputProps("email")}
        />
        <PasswordInput
          label="Password"
          placeholder="Password"
          required={true}
          {...form.getInputProps("password")}
        />
        <Group position="right" mt="md">
          <Button loading={loading} type="submit">
            Register
          </Button>
        </Group>
      </form>
    </Box>
  );
};

export default RegisterPage;
