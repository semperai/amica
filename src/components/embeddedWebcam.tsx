import { useCallback, useContext, useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { ChatContext } from "@/features/chat/chatContext";
import { IconButton } from "./iconButton";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

export function EmbeddedWebcam() {
  const { chat: bot } = useContext(ChatContext);
  const webcamRef = useRef<Webcam>(null);
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [cameraDisabled, setCameraDisabled] = useState(false);
  const [imageData, setImageData] = useState("");

  useKeyboardShortcut("Escape", () => {
    setWebcamEnabled(false);
  });

  useEffect(() => {
    (async () => {
      if (imageData !== "") {
        const fixed = imageData.replace("data:image/jpeg;base64,", "");
        await bot.getVisionResponse(fixed);
      }

      setCameraDisabled(false);
    })();
  }, [imageData]);

  const capture = useCallback(
    () => {
      if (webcamRef.current === null) {
        return;
      }

      let imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCameraDisabled(true);
        setImageData(imageSrc);
      }
    },
    [webcamRef]
  );


  return (
    <div className="relative mr-8">
      <div className="fixed">
        <IconButton
          iconName={webcamEnabled ? "24/Close" : "24/Camera"}
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
                facingMode,
              }}
              className={"rounded-bl-none rounded-br-none rounded-lg bg-black " + (cameraDisabled ? "animate-pulse" : "")  }
              />
            <div className="p-1 shadow-md flex flex-auto justify-center bg-gray-50 rounded-tl-none rounded-tr-none rounded-full">
              <IconButton
                iconName="24/Shutter"
                isProcessing={false}
                className="bg-secondary hover:bg-secondary-hover active:bg-secondary-active"
                onClick={() => capture()}
                disabled={cameraDisabled}
              />
              <IconButton
                iconName={facingMode === 'user' ? '24/Sun' : '24/FaceEdit'}
                isProcessing={false}
                className="ml-8"
                onClick={() => {
                  if (facingMode === 'user') {
                    setFacingMode('environment');
                  } else if (facingMode === 'environment') {
                    setFacingMode('user');
                  }
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
