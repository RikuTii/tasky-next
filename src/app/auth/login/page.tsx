"use client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./../../globals.css";
import { Button, Form } from "react-bootstrap";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";

const LoginPage = () => {
  const router = useRouter();
  const [validationErrors, setValidationErrors] = useState<any>();
  const [loading, setLoading] = useState(false);

  async function submitLogin(
    email: string | undefined,
    password: string | undefined
  ) {
    await signIn("credentials", {
      email: email,
      password: password,
    })
      .then(() => {
        setLoading(false);
        router.push("/dashboard");
      })
      .catch((e) => {
        console.log(e);
      });
  }

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    if (e.currentTarget.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
    }
    const data = new FormData(e.currentTarget);
    e.preventDefault();
    setLoading(true);
    submitLogin(
      data.get("email")?.toString(),
      data.get("password")?.toString()
    );
  };

  const loginValidated = validationErrors && validationErrors["invalid_login"];

  return (
    <div style={{ margin: 100, color: "white" }}>
      <Form onSubmit={(e) => onSubmit(e)}>
        <Form.Group className="mb-3" controlId="formUserName">
          <Form.Label>Username or email</Form.Label>
          <Form.Control
            type="text"
            name="email"
            placeholder="Enter username or email"
            required
            onChange={(e) => setValidationErrors(null)}
          />
          <Form.Control.Feedback type="invalid">
            Please choose a username.
          </Form.Control.Feedback>
          {loginValidated && (
            <p className="text-red">
              Username/email or password does not match
            </p>
          )}
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            placeholder="Password"
            required
            onChange={(e) => setValidationErrors(null)}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicCheckbox">
          <Form.Check type="checkbox" name="check" label="Remember me" />
        </Form.Group>
        <Button variant="primary" type="submit">
          Login
        </Button>
      </Form>
    </div>
  );
};

export default LoginPage;
