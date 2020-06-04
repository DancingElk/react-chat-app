import React, { useState, useContext, useEffect, useRef } from "react";
import Store from "../../Store";
import firebase from "../../firebase";
import { useMutable } from "../../customHooks/useMutable";
import { setCurrentChannel, setPrivateChannel } from "../../action";
import { Menu, Icon } from "semantic-ui-react";

export default function DirectMessages() {
  const { state, dispatch } = useContext(Store);
  const { ref: latestUsers, val: users, set: setUsers } = useMutable([]);
  const firstLoad = useRef(true);
  const [presenceUsers, setPresenceUsers] = useState([]);
  const [activeChannel, setActiveChannel] = useState("");
  const [usersRef] = useState(firebase.database().ref("users"));
  const [connectedRef] = useState(firebase.database().ref(".info/connected"));
  const [presenceRef] = useState(firebase.database().ref("presence"));

  useEffect(() => {
    return () => {
      //console.log("clean up");
      removeListeners();
    };
  }, []);

  useEffect(() => {
    //console.log("currentUser updated");
    if (state.user.currentUser) {
      //console.log("addListeners");
      addListeners(state.user.currentUser.uid);
    }
    // Clean up the Listeners
    return () => {
      //console.log("clean up Listeners");
      removeListeners();
    };
  }, [state.user.currentUser]);

  useEffect(() => {
    //console.log("users updated", users);
    //console.log("firstLoad", firstLoad.current);

    if (
      presenceUsers.length > 0 &&
      users.length > 0 &&
      users.length !== latestUsers.current.length &&
      firstLoad.current
    ) {
      updateStatusToUser();
      firstLoad.current = false;
    }
  }, [users]);

  useEffect(() => {
    //console.log("presenceUsers updated");
    if (presenceUsers.length > 0 && users.length > 0) {
      updateStatusToUser();
      firstLoad.current = false;
    }
  }, [presenceUsers]);

  const removeListeners = () => {
    usersRef.off();
    connectedRef.off();
    presenceRef.off();
  };

  const addListeners = currentUserUid => {
    let loadedUsers = [];
    usersRef.on("child_added", snap => {
      if (currentUserUid !== snap.key) {
        let user = snap.val();
        user["uid"] = snap.key;
        user["status"] = "offline";
        // mutates the array, but won't trigger a render
        loadedUsers.push(user);
        //creates a new array, which should trigger a render
        const loadedUsersClone = [...loadedUsers];
        //console.log("usersRef child_added");
        setUsers(loadedUsersClone);
      }
    });

    connectedRef.on("value", snap => {
      if (snap.val() === true) {
        const ref = presenceRef.child(currentUserUid);
        ref.set(true);
        ref.onDisconnect().remove(err => {
          if (err !== null) {
            console.error(err);
          }
        });
      }
    });

    presenceRef.on("child_added", snap => {
      if (currentUserUid !== snap.key) {
        addStatusToUser(snap.key);
        const loadedpresenceUsersClone = [...presenceUsers];
        if (!loadedpresenceUsersClone.includes(snap.key)) {
          loadedpresenceUsersClone.push(snap.key);
          setPresenceUsers(loadedpresenceUsersClone);
        }
      }
    });
    presenceRef.on("child_removed", snap => {
      if (currentUserUid !== snap.key) {
        addStatusToUser(snap.key, false);
        const loadedpresenceUsersClone = [...presenceUsers];
        if (loadedpresenceUsersClone.includes(snap.key)) {
          loadedpresenceUsersClone.splice(
            loadedpresenceUsersClone.indexOf(snap.key),
            1
          );
          setPresenceUsers(loadedpresenceUsersClone);
        }
      }
    });
  };

  const addStatusToUser = (userId, connected = true) => {
    const updatedUsers = latestUsers.current.reduce((acc, user) => {
      if (user.uid === userId) {
        user["status"] = `${connected ? "online" : "offline"}`;
      }
      return acc.concat(user);
    }, []);
    if (updatedUsers.length > 0) {
      //console.log("addStatusToUser");
      setUsers(updatedUsers);
    }
  };

  const updateStatusToUser = () => {
    const userUid = state.user.currentUser.uid;
    const updatedUsers = latestUsers.current.reduce((acc, user) => {
      const connected = presenceUsers.includes(user.uid);
      if (user.uid !== userUid) {
        user["status"] = `${connected ? "online" : "offline"}`;
      }
      return acc.concat(user);
    }, []);
    //console.log("updateStatusToUser");
    setUsers(updatedUsers);
  };

  const isUserOnline = user => user.status === "online";

  const changeChannel = user => {
    const channelId = getChannelId(user.uid);
    const channelData = {
      id: channelId,
      name: user.name
    };
    dispatch(setCurrentChannel(channelData));
    dispatch(setPrivateChannel(true));
    setActiveChannel(user.uid);
  };
  const getChannelId = userId => {
    const currentUserId = state.user.currentUser.uid;
    return userId < currentUserId
      ? `${userId}/${currentUserId}`
      : `${currentUserId}/${userId}`;
  };

  return (
    <Menu.Menu className="menu">
      <Menu.Item>
        <span>
          <Icon name="mail" /> DIRECT MESSAGES
        </span>
        &nbsp; ({users.length})
      </Menu.Item>
      {/* Users to Send Direct Messages */}
      {users.map(user => (
        <Menu.Item
          key={user.uid}
          active={user.uid === activeChannel}
          onClick={() => changeChannel(user)}
          style={{ ioacity: 0.7, fontStyle: "italic" }}
        >
          <Icon name="circle" color={isUserOnline(user) ? "green" : "red"} />@{" "}
          {user.name}
        </Menu.Item>
      ))}
    </Menu.Menu>
  );
}
