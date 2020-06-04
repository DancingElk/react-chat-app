import React, { useState, useContext, useEffect, Fragment } from "react";
import Store from "../../Store";
import firebase from "../../firebase";
import { setColors } from "../../action";
import {
  Sidebar,
  Menu,
  Divider,
  Button,
  Modal,
  Icon,
  Label,
  Segment
} from "semantic-ui-react";
import { SliderPicker } from "react-color";

export default function ColorPanel() {
  const { state, dispatch } = useContext(Store);
  const user = state.user.currentUser;
  const [modal, setModal] = useState(false);
  const [userColors, setUserColors] = useState([]);
  const [primary, setPrimary] = useState("#40bfa4");
  const [secondary, setSecondary] = useState("#4540bf");
  const [usersRef] = useState(firebase.database().ref("users"));

  useEffect(() => {
    if (user) {
      addListeners(user.uid);
    }
    // Clean up the Listeners
    return () => {
      removeListeners();
    };
  }, []);

  const removeListeners = () => {
    usersRef.child(`${user.uid}/colors`).off();
  };

  const addListeners = userId => {
    let userColors = [];
    usersRef.child(`${user.uid}/colors`).on("child_added", snap => {
      userColors.unshift(snap.val());
      //console.log(userColors);
      setUserColors(userColors);
    });
  };

  const displayUserColors = colors =>
    colors.length > 0 &&
    colors.map((color, i) => (
      <Fragment key={i}>
        <Divider />
        <div
          className="color__container"
          onClick={() => {
            dispatch(setColors(color.primary, color.secondary));
          }}
        >
          <div className="color__square" style={{ background: color.primary }}>
            <div
              className="color__overlay"
              style={{ background: color.secondary }}
            />
          </div>
        </div>
      </Fragment>
    ));

  const closeModal = () => {
    setModal(false);
  };

  const openModal = () => {
    setModal(true);
  };

  const handleChangeColorPicker = picker => color => {
    switch (picker) {
      case "primary":
        setPrimary(color.hex);
        break;
      case "secondary":
        setSecondary(color.hex);
        break;
      default:
        break;
    }
  };

  const handleSaveColor = () => {
    if (primary && secondary) {
      saveColors(primary, secondary);
    }
  };

  const saveColors = (primary, secondary) => {
    usersRef
      .child(`${user.uid}/colors`)
      .push()
      .update({
        primary,
        secondary
      })
      .then(() => {
        //console.log("color saved");
        closeModal();
      })
      .catch(err => console.error(err));
  };

  return (
    <Sidebar
      as={Menu}
      icon="labeled"
      inverted
      vertical
      visible
      width="very thin"
    >
      <Divider />
      <Button icon="add" size="small" color="blue" onClick={openModal} />
      {displayUserColors(userColors)}

      {/* Color Picker Modal */}
      <Modal basic open={modal} onClose={closeModal}>
        <Modal.Header>Choose App Colors</Modal.Header>
        <Modal.Content>
          <Segment inverted>
            <Label content="Primary Color" />
            <SliderPicker
              color={primary}
              onChange={handleChangeColorPicker("primary")}
            />
          </Segment>
          <Segment inverted>
            <Label content="Secondary Color" />
            <SliderPicker
              color={secondary}
              onChange={handleChangeColorPicker("secondary")}
            />
          </Segment>
        </Modal.Content>

        <Modal.Actions>
          <Button color="green" inverted onClick={handleSaveColor}>
            <Icon name="checkmark" /> Save Colors
          </Button>
          <Button color="red" inverted onClick={closeModal}>
            <Icon name="remove" /> Cancel
          </Button>
        </Modal.Actions>
      </Modal>
    </Sidebar>
  );
}
