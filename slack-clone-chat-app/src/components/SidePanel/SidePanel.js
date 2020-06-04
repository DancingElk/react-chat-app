import React, { useContext } from "react";
import UserPanel from "./UserPanel";
import Channels from "./Channels";
import DirectMessages from "./DirectMessages";
import Starred from "./Starred";
import Store from "../../Store";
import { Menu } from "semantic-ui-react";

export default function SidePanel() {
  const { state } = useContext(Store);
  const primaryColor = state.colors.primaryColor;
  return (
    <Menu
      size="large"
      inverted
      fixed="left"
      vertical
      style={{ background: primaryColor, fontSize: "1.2rem" }}
    >
      <UserPanel />
      <Starred />
      <Channels />
      <DirectMessages />
    </Menu>
  );
}
