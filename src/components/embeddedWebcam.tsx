import { useCallback, useContext, useState, useRef } from "react";
import Webcam from "react-webcam";
import { ChatContext } from "@/features/chat/chatContext";
import { IconButton } from "./iconButton";

export function EmbeddedWebcam() {
  const { chat: bot } = useContext(ChatContext);
  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(() => {
      if (webcamRef.current === null) {
        return;
      }

      let imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        imageSrc = imageSrc.replace("data:image/jpeg;base64,", "");
        bot.getVisionResponse(imageSrc);
      }
    },
    [webcamRef]
  );

  const [webcamEnabled, setWebcamEnabled] = useState(false);

  return (
    <div className="relative mr-8">
      <div className="fixed">
        <IconButton
          iconName={webcamEnabled ? "24/Close" : "24/CameraVideo"}
          isProcessing={false}
          className="bg-secondary hover:bg-secondary-hover active:bg-secondary-active"
          onClick={() => {
            setWebcamEnabled(!webcamEnabled);
          }} />
        {webcamEnabled && (
          <>
            <Webcam
              ref={webcamRef}
              audio={false}
              width={320}
              height={240}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                facingMode: "user",
              }}
              />
            <IconButton
              iconName="24/Camera"
              isProcessing={false}
              className="bg-secondary hover:bg-secondary-hover active:bg-secondary-active"
              onClick={() => capture()}
            />
          </>
        )}
      </div>
    </div>
  )
}
