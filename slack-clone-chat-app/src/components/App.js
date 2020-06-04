import React, { useContext } from "react";
import { Grid } from "semantic-ui-react";
import Store from "../Store";
import ColorPanel from "./ColorPanel/ColorPanel";
import SidePanel from "./SidePanel/SidePanel";
import Messages from "./Messages/Messages";
import MetaPanel from "./MetaPanel/MetaPanel";
import "./App.css";

function App() {
  const { state } = useContext(Store);
  const secondaryColor = state.colors.secondaryColor;
  return (
    <Grid
      columns="equal"
      className="app"
      style={{ background: secondaryColor }}
    >
      <ColorPanel />
      <SidePanel />
      <Grid.Column style={{ marginLeft: 320 }}>
        <Messages />
      </Grid.Column>
      <Grid.Column width={4}>
        <MetaPanel />
      </Grid.Column>
    </Grid>
  );
}

export default App;
