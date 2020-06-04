import React, { useEffect, useContext } from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import Login from "./components/Auth/Login";
import Spinner from "./components/common/Spinner";
import Register from "./components/Auth/Register";
import * as serviceWorker from "./serviceWorker";
import firebase from "./firebase";
import history from "./history";
import { setUser, clearUser } from "./action";
import Store, { StoreProvider } from "./Store";

import "semantic-ui-css/semantic.min.css";

import { Router, Switch, Route } from "react-router-dom";

const Root = () => {
  const { state, dispatch } = useContext(Store);

  useEffect(() => {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        dispatch(setUser(user));
        history.push("/");
      } else {
        history.push("/login");
        dispatch(clearUser());
      }
    });
  }, []);

  return state.user.isLoading ? (
    <Spinner />
  ) : (
    <Switch>
      <Route exact path="/" component={App} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
    </Switch>
  );
};

ReactDOM.render(
  <StoreProvider>
    <Router history={history}>
      <Root />
    </Router>
  </StoreProvider>,
  document.getElementById("root")
);

serviceWorker.unregister();
