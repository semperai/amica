import { useCallback, useState, useRef } from "react";
import Webcam from "react-webcam";
import { IconButton } from "./iconButton";

export function EmbeddedWebcam() {
  const webcamRef = useRef<Webcam>(null);
  const capture = useCallback(
    () => {
      if (webcamRef.current === null) {
        return;
      }

      const imageSrc = webcamRef.current.getScreenshot();
    },
    [webcamRef]
  );

  const [webcamEnabled, setWebcamEnabled] = useState(false);

  return (
    <div className="absolute top-0 right-0">
      <IconButton
        iconName={webcamEnabled ? "24/Close" : "24/CameraVideo"}
        isProcessing={false}
        className="bg-secondary hover:bg-secondary-hover active:bg-secondary-active"
        onClick={() => {
          setWebcamEnabled(!webcamEnabled);
        }} />
      {webcamEnabled && (
        <Webcam
          audio={false}
          width={320}
          height={240}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            facingMode: "user",
          }}
          />
      )}
    </div>
  )
}
