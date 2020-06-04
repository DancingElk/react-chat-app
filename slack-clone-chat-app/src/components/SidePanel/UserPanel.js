import React, { useContext, useState, useRef, useEffect } from "react";
import AvatarEditor from "react-avatar-editor";
import firebase from "../../firebase";
import Store from "../../Store";
import {
  Grid,
  Header,
  Icon,
  Dropdown,
  Image,
  Modal,
  Input,
  Button
} from "semantic-ui-react";

export default function UserPanel() {
  const { state } = useContext(Store);
  const avatarEditor = useRef(null);
  const user = state.user.currentUser;
  const [modal, setModal] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [croppedImage, setCroppedImage] = useState("");
  const [uploadedCroppedImage, setupLoadedCroppedImage] = useState("");
  const [blob, setBlob] = useState("");
  const [storageRef] = useState(firebase.storage().ref());
  const [userRef] = useState(firebase.auth().currentUser);
  const [usersRef] = useState(firebase.database().ref("users"));

  useEffect(() => {
    if (uploadedCroppedImage) {
      changeAvatar(uploadedCroppedImage);
    }
  }, [uploadedCroppedImage]);

  const clearImage = () => {
    setPreviewImage("");
    setCroppedImage("");
    setupLoadedCroppedImage("");
    setBlob("");
  };

  const changeAvatar = uploadedCroppedImage => {
    userRef
      .updateProfile({
        photoURL: uploadedCroppedImage
      })
      .then(() => {
        //console.log("PhotoURL updated");
        closeModal();
      })
      .catch(err => console.error(err));

    usersRef
      .child(userRef.uid)
      .update({
        avatar: uploadedCroppedImage
      })
      .then(() => {
        //console.log("User Avatar updated");
      })
      .catch(err => console.error(err));
  };

  const uploadCroppedImage = () => {
    const metadata = { contentType: "image/jpeg" };
    storageRef
      .child(`avatars/users/${userRef.uid}`)
      .put(blob, metadata)
      .then(snap => {
        snap.ref.getDownloadURL().then(downloadUrl => {
          console.log(downloadUrl);
          setupLoadedCroppedImage(downloadUrl);
        });
      })
      .catch(err => console.error(err));
  };

  const handleChangeImage = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    if (file) {
      reader.readAsDataURL(file);
      reader.addEventListener("load", () => {
        setPreviewImage(reader.result);
      });
    }
  };

  const handleCropImage = () => {
    if (avatarEditor && previewImage) {
      avatarEditor.current.getImageScaledToCanvas().toBlob(blob => {
        let imageUrl = URL.createObjectURL(blob);
        setCroppedImage(imageUrl);
        setBlob(blob);
      });
    }
  };

  const handleSignout = () => {
    firebase
      .auth()
      .signOut()
      .then(() => console.log("signout"))
      .catch(err => console.log(err));
  };

  const dropdownOptions = () => [
    {
      key: "user",
      text: (
        <span>
          Signed in as <strong>{user.displayName}</strong>
        </span>
      ),
      disabled: true
    },
    {
      key: "avatar",
      text: <span onClick={openModal}>Change Avatar</span>
    },
    {
      key: "signout",
      text: <span onClick={handleSignout}>Sign Out</span>
    }
  ];

  const closeModal = () => {
    setModal(false);
    clearImage();
  };

  const openModal = () => {
    setModal(true);
  };

  return (
    <Grid>
      <Grid.Column>
        <Grid.Row style={{ padding: "1.2em", margin: 0 }}>
          {/* App header */}
          <Header inverted floated="left" as="h2">
            <Icon name="code" />
            <Header.Content>DevChat</Header.Content>
          </Header>
          {/* User Dropdown */}
          <Header style={{ padding: "0.25em" }} as="h4" inverted>
            <Dropdown
              trigger={
                <span>
                  <Image src={user.photoURL} spaced="right" avatar />
                  {user.displayName}
                </span>
              }
              options={dropdownOptions()}
            />
          </Header>
        </Grid.Row>

        {/* Change User Avatar Modal */}
        <Modal basic open={modal} onClose={closeModal}>
          <Modal.Header>Change Avatar</Modal.Header>
          <Modal.Content>
            <Input
              onChange={handleChangeImage}
              fluid
              type="file"
              label="New Avatar"
              name="previewImage"
            />
            <Grid centered stackable columns={2}>
              <Grid.Row centered>
                <Grid.Column className="ui center aligned grid">
                  {previewImage && (
                    <AvatarEditor
                      ref={node => (avatarEditor.current = node)}
                      image={previewImage}
                      width={120}
                      height={120}
                      border={50}
                      scale={1.2}
                    />
                  )}
                </Grid.Column>
                <Grid.Column>
                  {croppedImage && (
                    <Image
                      style={{ margin: "3.5em auto" }}
                      width={100}
                      height={100}
                      src={croppedImage}
                    />
                  )}
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Modal.Content>

          <Modal.Actions>
            {croppedImage && (
              <Button color="green" inverted onClick={uploadCroppedImage}>
                <Icon name="save" /> Change Avatar
              </Button>
            )}
            <Button color="green" inverted onClick={handleCropImage}>
              <Icon name="image" /> Preview
            </Button>
            <Button color="red" inverted onClick={closeModal}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </Grid.Column>
    </Grid>
  );
}
