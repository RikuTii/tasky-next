"use client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./../../globals.css";
import { Button, Form } from "react-bootstrap";
import { Dispatch, FormEvent, useState } from "react";
import { useRouter } from 'next/navigation'

const RegisterPage = () => {
  const router = useRouter();
  const [validationErrors, setValidationErrors] = useState<any>();

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
      setValidationErrors(data.errors);
    }
     else {
      router.push("/");
     }
  }

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    if (e.currentTarget.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
    }
    const data = new FormData(e.currentTarget);
    e.preventDefault();
    submitRegister(data.get("email")?.toString(),data.get("username")?.toString(),data.get("password")?.toString());
  };

  const emailValidated = validationErrors && validationErrors["email_taken"];
  const userNameValidated = validationErrors && validationErrors["user_taken"];


  return (
    <div style={{ margin: 100, color: "white" }}>
      <Form onSubmit={(e) => onSubmit(e)}>
        <Form.Group className="mb-3" controlId="formUserName">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            name="username"
            placeholder="Enter username"
            required
            onChange={(e) => setValidationErrors(null)}
          />
          <Form.Control.Feedback type="invalid">
            Please choose a username.
          </Form.Control.Feedback>
          {userNameValidated && (
            <p className="text-red">Username is already taken</p>
          )}
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            name="email"
            placeholder="Enter email"
            required
            onChange={(e) => setValidationErrors(null)}
          />
          {emailValidated && (
            <p className="text-red">Email is already registered</p>
          )}
          <Form.Control.Feedback type="invalid">
            Please choose a username.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            placeholder="Password"
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicCheckbox">
          <Form.Check type="checkbox" name="check" label="Check me out" />
        </Form.Group>
        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form>
    </div>
  );
};

export default RegisterPage;
