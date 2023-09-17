"use client";
import "@/globals.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "@mantine/form";
import { useOs } from "@mantine/hooks";
import {
  Box,
  Group,
  TextInput,
  Button,
  PasswordInput,
  Center,
  Container,
} from "@mantine/core";

interface LoginForm {
  username: string;
  password: string;
}

const LoginPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const os = useOs();

  const form = useForm<LoginForm>({
    initialValues: { username: "", password: "" },
    validate: {
      username: (value) =>
        value.length < 2 ? "Username must have at least 2 letters" : null,
      password: (value) =>
        value.length < 5 ? "Password must have at least 5 letters" : null,
    },
  });

  async function submitLogin(
    email: string | undefined,
    password: string | undefined
  ) {
    const response = await signIn("credentials", {
      email: email,
      password: password,
      device: os,
      redirect: false,
      redirectUrl: "/",
    });

    setLoading(false);
    if (response?.error === "CredentialsSignin") {
      form.setErrors({
        username: "Username or password does not match",
        password: "Username or password does not match",
      });
    } else {
      router.push("/");
    }
  }

  const onSubmit = (values: LoginForm) => {
    if (form.validate().hasErrors === false) {
      setLoading(true);
      submitLogin(values.username, values.password);
    }
  };

  return (
    <Center w="100vw" h="400px">
      <Container w={450} mx="auto">
        <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
          <TextInput
            sx={{ marginBottom: 8 }}
            label="Username/email"
            placeholder="Username or email"
            required={true}
            autoCorrect=""
            autoCapitalize="none"
            autoComplete="none"
            {...form.getInputProps("username")}
          />
          <PasswordInput
            label="Password"
            placeholder="Password"
            required={true}
            autoCorrect=""
            autoCapitalize="none"
            autoComplete="none"
            {...form.getInputProps("password")}
          />
          <Group position="right" mt="md">
            <Button loading={loading} type="submit">
              Login
            </Button>
          </Group>
        </form>
      </Container>
    </Center>
  );
};

export default LoginPage;
