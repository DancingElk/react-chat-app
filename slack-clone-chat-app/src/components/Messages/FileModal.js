import React, { useState } from "react";
import mime from "mime-types";
import { Icon, Modal, Input, Button } from "semantic-ui-react";

export default function FileModal({ modal, closeModal, uploadFile }) {
  const [file, setFile] = useState(null);

  const isAuthorized = filename => {
    const authorized = ["image/jpeg", "image/png"];
    return authorized.includes(mime.lookup(filename));
  };

  const addFile = e => {
    const firstFile = e.target.files[0];
    if (firstFile) {
      setFile(firstFile);
    }
  };

  const sendFile = () => {
    if (file !== null) {
      if (isAuthorized(file.name)) {
        const metadata = { contentType: mime.lookup(file.name) };
        uploadFile(file, metadata);
        closeModal();
        clearFile();
      }
    }
  };

  const clearFile = () => {
    setFile(null);
  };

  return (
    <Modal basic open={modal} onClose={closeModal}>
      <Modal.Header>Select an Image File</Modal.Header>
      <Modal.Content>
        <Input
          fluid
          label="File types: jpg, png"
          name="file"
          type="file"
          onChange={addFile}
          autoFocus
        />
      </Modal.Content>

      <Modal.Actions>
        <Button color="green" inverted onClick={sendFile}>
          <Icon name="checkmark" /> Send
        </Button>
        <Button color="red" inverted onClick={closeModal}>
          <Icon name="remove" /> Cancel
        </Button>
      </Modal.Actions>
    </Modal>
  );
}
