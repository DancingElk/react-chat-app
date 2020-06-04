import React, { useReducer } from "react";
import reducers from "./reducers";

const Store = React.createContext();

const initialState = reducers({}, {});

export function StoreProvider(props) {
  const [state, dispatch] = useReducer(reducers, initialState);
  const value = { state, dispatch };

  return <Store.Provider value={value}>{props.children}</Store.Provider>;
}

export default Store;
