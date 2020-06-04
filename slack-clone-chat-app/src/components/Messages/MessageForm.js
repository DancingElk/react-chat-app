import React, { useState, useContext, useRef, useEffect } from "react";
import uuidv4 from "uuid/v4";
import { useInput } from "../../customHooks/useInput";
import firebase from "../../firebase";
import Store from "../../Store";
import { Segment, Input, Button } from "semantic-ui-react";
import { Picker, emojiIndex } from "emoji-mart";

import "emoji-mart/css/emoji-mart.css";

import FileModal from "./FileModal";
import ProgressBar from "./ProgressBar";

export default function MessageForm({ getMessagesRef, isPrivateChannel }) {
  const { state } = useContext(Store);
  const channel = state.channel.currentChannel;
  const user = state.user.currentUser;
  const inputMessage = useRef(null);
  const {
    value: message,
    setValue: setMessage,
    bind: bindMessage,
    reset: resetMessage
  } = useInput("");
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [emojiPicker, setEmojiPicker] = useState(false);
  const [uploadState, setUploadState] = useState("");
  const [uploadTask, setUploadTask] = useState(null);
  const [precentUploaded, setPrecentUploaded] = useState(0);
  const [storageRef] = useState(firebase.storage().ref());
  const [typingRef] = useState(firebase.database().ref("typing"));

  const handleUploadError = err => {
    console.error(err);
    setErrors([...errors].concat(err));
    setUploadState("error");
    setUploadTask(null);
  };

  useEffect(() => {
    if (uploadTask !== null) {
      uploadTask.task.on(
        "state_changed",
        snap => {
          const precentUploadedLocal = Math.round(
            (snap.bytesTransferred / snap.totalBytes) * 100
          );
          setPrecentUploaded(precentUploadedLocal);
        },
        err => handleUploadError(err),
        () => {
          uploadTask.task.snapshot.ref
            .getDownloadURL()
            .then(downloadUrl => {
              //console.log(downloadUrl);
              sendFileMessage(
                downloadUrl,
                uploadTask.ref,
                uploadTask.pathToUpload
              );
            })
            .catch(err => handleUploadError(err));
        }
      );
    }
    // Clean up the Listeners
    return () => {
      if (uploadTask !== null) {
        uploadTask.task.cancel();
        setUploadTask(null);
      }
    };
  }, [uploadTask]);

  const sendFileMessage = (fileUrl, ref, pathToUpload) => {
    ref
      .child(pathToUpload)
      .push()
      .set(createMessage(fileUrl))
      .then(() => {
        setUploadState("done");
      })
      .catch(err => handleUploadError(err));
  };

  const handleErrors = inputName => {
    return errors.some(error => error.message.toLowerCase().includes(inputName))
      ? "error"
      : "";
  };

  const openModal = () => {
    setModal(true);
  };

  const closeModal = () => {
    setModal(false);
  };

  const getPath = () => {
    if (isPrivateChannel) {
      return `chat/private/${channel.id}`;
    } else {
      return "chat/public";
    }
  };

  const uploadFile = (file, metadata) => {
    const pathToUpload = channel.id;
    const filePath = `${getPath()}/${uuidv4()}`;

    setUploadState("uploading");
    setUploadTask({
      task: storageRef.child(filePath).put(file, metadata),
      pathToUpload,
      ref: getMessagesRef().ref
    });
  };

  const createMessage = (fileUrl = null) => {
    const messageObj = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        id: user.uid,
        name: user.displayName,
        avatar: user.photoURL
      }
    };
    if (fileUrl !== null) {
      messageObj["image"] = fileUrl;
    } else {
      messageObj["content"] = message;
    }

    return messageObj;
  };

  const sendMessage = () => {
    if (message && channel) {
      setLoading(true);
      getMessagesRef()
        .ref.child(channel.id)
        .push()
        .set(createMessage())
        .then(() => {
          setLoading(false);
          resetMessage();
          setErrors([]);
          typingRef
            .child(channel.id)
            .child(user.uid)
            .remove();
          inputMessage.current.focus();
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
          const newError = [...errors].concat(err);
          setErrors(newError);
          inputMessage.current.focus();
        });
    } else {
      const err = {
        message: "Add a message"
      };
      console.error(err);
      const newError = [...errors].concat(err);
      setErrors(newError);
      inputMessage.current.focus();
    }
  };

  const handleKeyDown = event => {
    if (event.keyCode === 13) {
      sendMessage();
    }
    if (message) {
      typingRef
        .child(channel.id)
        .child(user.uid)
        .set(user.displayName);
    } else {
      typingRef
        .child(channel.id)
        .child(user.uid)
        .remove();
    }
  };

  const handleTogglePicker = () => {
    setEmojiPicker(c => !c);
  };

  const colonToUnicode = message => {
    return message.replace(/:[A-Za-z0-9_+-]+:/g, x => {
      x = x.replace(/:/g, "");
      let emoji = emojiIndex.emojis[x];
      if (typeof emoji !== "undefined") {
        let unicode = emoji.native;
        if (typeof unicode !== "undefined") {
          return unicode;
        }
      }
      x = ":" + x + ":";
      return x;
    });
  };

  const handleAddEmoji = emoji => {
    const oldMessage = message;
    const newMessage = colonToUnicode(` ${oldMessage} ${emoji.colons}`);
    setMessage(newMessage);
    setEmojiPicker(false);
    setTimeout(() => inputMessage.current.focus(), 0);
  };

  return (
    <Segment className="message__form">
      {emojiPicker && (
        <Picker
          set="apple"
          onSelect={handleAddEmoji}
          className="emojipicker"
          title="Pick your emoji"
          emoji="point_up"
        />
      )}
      <Input
        fluid
        name="message"
        ref={inputMessage}
        {...bindMessage}
        onKeyDown={handleKeyDown}
        className={handleErrors("message")}
        style={{ marginBottom: "0.7em" }}
        label={
          <Button
            icon={emojiPicker ? "close" : "add"}
            content={emojiPicker ? "Close" : null}
            onClick={handleTogglePicker}
          />
        }
        labelPosition="left"
        placeholder="write your message"
        autoFocus
      />
      <Button.Group icon widths="2">
        <Button
          color="orange"
          content="Add Reply"
          labelPosition="left"
          icon="edit"
          disabled={loading}
          onClick={sendMessage}
        />
        <Button
          color="teal"
          disabled={uploadState === "uploading"}
          content="Upload Media"
          labelPosition="right"
          icon="cloud upload"
          onClick={openModal}
        />
      </Button.Group>
      <FileModal
        modal={modal}
        closeModal={closeModal}
        uploadFile={uploadFile}
      />
      <ProgressBar
        uploadState={uploadState}
        precentUploaded={precentUploaded}
      />
    </Segment>
  );
}
