import React, { useContext, useState, useEffect } from "react";
import firebase from "../../firebase";
import Store from "../../Store";
import { useMutable } from "../../customHooks/useMutable";
import { setCurrentChannel, setPrivateChannel } from "../../action";
import { Menu, Icon } from "semantic-ui-react";

export default function Starred() {
  const { state, dispatch } = useContext(Store);
  const {
    ref: starredChannelsRef,
    val: starredChannels,
    set: setStarredChannels
  } = useMutable([]);
  const [activeChannel, setActiveChannel] = useState("");
  const [usersRef] = useState(firebase.database().ref("users"));

  useEffect(() => {
    const user = state.user.currentUser;
    const channel = state.channel.currentChannel;

    if (user) {
      addListeners(user.uid);
    }

    return () => {
      removeListeners();
    };
  }, []);

  const addListeners = userId => {
    usersRef
      .child(userId)
      .child("starred")
      .on("child_added", snap => {
        const starredChannel = { id: snap.key, ...snap.val() };
        const starredChannelsLocal = [...starredChannelsRef.current].concat(
          starredChannel
        );
        setStarredChannels(starredChannelsLocal);
      });

    usersRef
      .child(userId)
      .child("starred")
      .on("child_removed", snap => {
        const channelToRemove = { id: snap.key, ...snap.val() };
        const filteredChannels = [...starredChannelsRef.current].filter(
          channel => {
            return channel.id !== channelToRemove.id;
          }
        );
        setStarredChannels(filteredChannels);
      });
  };
  const removeListeners = () => {
    setStarredChannels([]);
    usersRef.child(`${state.user.currentUser.uid}/starred`).off();
  };

  const changeChannel = channel => {
    setActiveChannel(channel.id);
    dispatch(setCurrentChannel(channel));
    dispatch(setPrivateChannel(false));
  };

  const displayChannels = channels => {
    return (
      channels.length > 0 &&
      channels.map(channel => (
        <Menu.Item
          key={channel.id}
          onClick={() => changeChannel(channel)}
          name={channel.name}
          style={{ opacity: 0.7 }}
          active={channel.id === activeChannel}
        >
          # {channel.name}
        </Menu.Item>
      ))
    );
  };

  return (
    <Menu.Menu className="menu">
      <Menu.Item>
        <span>
          <Icon name="star" /> STARRED
        </span>
        &nbsp; ({starredChannels.length})
      </Menu.Item>
      {/* starredChannels */}
      {displayChannels(starredChannels)}
    </Menu.Menu>
  );
}
