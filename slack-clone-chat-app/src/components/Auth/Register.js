import React, { useState } from "react";
import md5 from "md5";
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

export default function Register() {
  const {
    value: username,
    bind: bindUsername,
    reset: resetUsername
  } = useInput("");
  const { value: email, bind: bindEmail, reset: resetEmail } = useInput("");
  const {
    value: password,
    bind: bindPassword,
    reset: resetPassword
  } = useInput("");
  const {
    value: passwordConfirmation,
    bind: bindPasswordConfirmation,
    reset: resetPasswordConfirmation
  } = useInput("");
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usersRef] = useState(firebase.database().ref("users"));

  const handleErrors = inputName => {
    return errors.some(error => error.message.toLowerCase().includes(inputName))
      ? "error"
      : "";
  };

  const isFormEmpty = () => {
    return (
      !username.length ||
      !email.length ||
      !password.length ||
      !passwordConfirmation.length
    );
  };

  const isPasswordValid = () => {
    if (password.length < 6 || passwordConfirmation.length < 6) {
      return false;
    } else if (password !== passwordConfirmation) {
      //console.log("password not same as passwordConfirmation");
      return false;
    } else {
      return true;
    }
  };

  const displayErrors = () => {
    return errors.map((error, i) => <p key={i}>{error.message}</p>);
  };

  const isFormValid = () => {
    let errors = [];
    let error;

    if (isFormEmpty()) {
      error = { message: "Fill in all fields" };
      setErrors(errors.concat(error));
      return false;
    } else if (!isPasswordValid()) {
      error = { message: "Password is invalid" };
      setErrors(errors.concat(error));
      return false;
    } else {
      return true;
    }
  };

  const saveUser = createdUser => {
    return usersRef.child(createdUser.user.uid).set({
      name: createdUser.user.displayName,
      avatar: createdUser.user.photoURL
    });
  };

  const handleSubmit = e => {
    e.preventDefault();

    if (isFormValid()) {
      setErrors([]);
      setLoading(true);
      firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then(createdUser => {
          //console.log(createdUser);
          createdUser.user
            .updateProfile({
              displayName: username,
              photoURL: `http://gravatar.com/avatar/${md5(
                createdUser.user.email
              )}?d=identicon`
            })
            .then(() => {
              saveUser(createdUser)
                .then(() => {
                  //console.log("user saved");
                  setLoading(false);
                  resetUsername();
                  resetEmail();
                  resetPassword();
                  resetPasswordConfirmation();
                })
                .catch(err => {
                  console.error(err);
                  setLoading(false);
                  setErrors([err]);
                });
            })
            .catch(err => {
              console.error(err);
              setLoading(false);
              setErrors([err]);
            });
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
        <Header as="h1" icon color="orange" textAlign="center">
          <Icon name="puzzle piece" color="orange" />
          Register for DevChat
        </Header>
        <Form onSubmit={handleSubmit} size="large">
          <Segment stacked>
            <Form.Input
              fluid
              name="username"
              icon="user"
              iconPosition="left"
              placeholder="Username"
              {...bindUsername}
              className={handleErrors("username")}
              type="text"
            />
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
            <Form.Input
              fluid
              name="passwordConfirmation"
              icon="repeat"
              iconPosition="left"
              placeholder="Password Confirm"
              {...bindPasswordConfirmation}
              className={handleErrors("password")}
              type="password"
            />

            <Button
              disabled={loading}
              className={loading ? "loading" : ""}
              color="orange"
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
          Already a user? <Link to="/login">Login</Link>
        </Message>
      </Grid.Column>
    </Grid>
  );
}
