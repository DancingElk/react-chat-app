import React from "react";
import { Progress } from "semantic-ui-react";

export default function ProgressBar({ uploadState, precentUploaded }) {
  return (
    uploadState === "uploading" && (
      <Progress
        className="progress__bar"
        percent={precentUploaded}
        progress
        indicating
        size="medium"
        inverted
      />
    )
  );
}
