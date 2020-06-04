import React, { useState } from "react";
import { useInput } from "../../customHooks/useInput";
import firebase from "../../firebase";
import {
  Grid,
  Form,
  Segment,
  Button,
  Header,
  Message,
  Icon
} from "semantic-ui-react";

import { Link } from "react-router-dom";

export default function Login() {
  const { value: email, bind: bindEmail, reset: resetEmail } = useInput("");
  const {
    value: password,
    bind: bindPassword,
    reset: resetPassword
  } = useInput("");
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleErrors = inputName => {
    return errors.some(error => error.message.toLowerCase().includes(inputName))
      ? "error"
      : "";
  };

  const displayErrors = () => {
    return errors.map((error, i) => <p key={i}>{error.message}</p>);
  };

  const isFormValid = () => {
    let errors = [];
    let error;

    if (email.length <= 0) {
      error = { message: "Fill in email" };
      errors.push(error);
    }
    if (password.length <= 0) {
      error = { message: "Fill in password" };
      errors.push(error);
    }
    if (errors.length > 0) {
      setErrors(errors);
      return false;
    } else {
      return true;
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (isFormValid()) {
      setErrors([]);
      setLoading(true);
      firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then(signedUser => {
          //console.log(signedUser);
          setLoading(false);
          resetEmail();
          resetPassword();
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
          setErrors([err]);
        });
    }
  };

  return (
    <Grid textAlign="center" verticalAlign="middle" className="app">
      <Grid.Column style={{ maxWidth: 450 }}>
        <Header as="h1" icon color="violet" textAlign="center">
          <Icon name="code branch" color="violet" />
          Login to DevChat
        </Header>
        <Form onSubmit={handleSubmit} size="large">
          <Segment stacked>
            <Form.Input
              fluid
              name="email"
              icon="mail"
              iconPosition="left"
              placeholder="Email Address"
              {...bindEmail}
              className={handleErrors("email")}
              type="email"
            />
            <Form.Input
              fluid
              name="password"
              icon="lock"
              iconPosition="left"
              placeholder="Password"
              {...bindPassword}
              className={handleErrors("password")}
              type="password"
            />
            <Button
              disabled={loading}
              className={loading ? "loading" : ""}
              color="violet"
              fluid
              size="large"
            >
              Submit
            </Button>
          </Segment>
        </Form>
        {errors.length > 0 && (
          <Message error>
            <h3>Error</h3>
            {displayErrors()}
          </Message>
        )}
        <Message>
          Don't have an account? <Link to="/register">Register</Link>
        </Message>
      </Grid.Column>
    </Grid>
  );
}
