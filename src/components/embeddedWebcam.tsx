import { useCallback, useContext, useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { ChatContext } from "@/features/chat/chatContext";
import { IconButton } from "./iconButton";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { clsx } from "clsx";

export function EmbeddedWebcam({
  setWebcamEnabled,
}: {
  setWebcamEnabled: (enabled: boolean) => void;
}) {
  const { chat: bot } = useContext(ChatContext);
  const webcamRef = useRef<Webcam>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [cameraDisabled, setCameraDisabled] = useState(false);
  const [imageData, setImageData] = useState("");
  const [fileType, setFileType] = useState<string | undefined>(undefined);

  useKeyboardShortcut("Escape", () => {
    setWebcamEnabled(false);
  });

  useEffect(() => {
    (async () => {
      if (imageData !== "" && fileType) {
        const dataPrefix = `data:image/${fileType};base64,`;
        const fixed = imageData.replace(dataPrefix, "");
        await bot.getVisionResponse(fixed);
      }

      setCameraDisabled(false);
    })();
  }, [imageData, fileType, bot]);

  const capture = useCallback(
    () => {
      if (webcamRef.current === null) {
        return;
      }

      let imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCameraDisabled(true);
        setImageData(imageSrc);
        setFileType('jpeg');
      }
    },
    [webcamRef]
  );

  const imgFileInputRef = useRef<HTMLInputElement>(null);
  const handleClickOpenImgFile = useCallback(() => {
    imgFileInputRef.current?.click();
  }, []);

  const handleChangeImgFile = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files) return;

      const file = files?.[0];
      if (!file) return;

      if (!file.type.match('image.*')) return;

      const fileType = file.type.split("/").pop();
      console.debug(`${fileType} : ${file}`)
      setFileType(fileType);

      const reader = new FileReader();
      reader.onloadend = () => {
        const imageSrc = reader.result as string;
        setCameraDisabled(true);
        setImageData(imageSrc);
      };
      reader.readAsDataURL(file);

      event.target.value = "";
    }, []);


  return (
    <div className="fixed right-[calc(320px)] top-0 z-[11]">
      <div className="fixed">
        <>
          {!cameraDisabled && (
            <Webcam
              ref={webcamRef}
              audio={false}
              width={320}
              height={240}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                facingMode,
              }}
              className={clsx(
                "rounded-bl-none rounded-br-none rounded-lg bg-black",
                cameraDisabled && "animate-pulse"
              )}
            />
          )}
          {cameraDisabled && (
            <img
              src={imageData}
              alt="Captured image"
              width={320}
              height={240}
              className={clsx(
                "rounded-bl-none rounded-br-none rounded-lg bg-black",
                cameraDisabled && "animate-pulse",
              )}
            />
          )}
          <div className="p-1 shadow-md flex flex-auto justify-evenly bg-gray-50 rounded-tl-none rounded-tr-none rounded-full">
            <IconButton
              iconName="24/UploadAlt"
              isProcessing={false}
              className="bg-secondary hover:bg-secondary-hover active:bg-secondary-active"
              onClick={handleClickOpenImgFile}
              disabled={cameraDisabled}
            />
            <IconButton
              iconName="24/Shutter"
              isProcessing={false}
              className="bg-secondary hover:bg-secondary-hover active:bg-secondary-active"
              onClick={() => capture()}
              disabled={cameraDisabled}
            />

            <button className="pr-2 rounded-lg text-sm p-1 text-center inline-flex items-center">
              <ArrowPathIcon
                className="w-5 h-5 text-gray-700 focus:animate-spin"
                onClick={() => {
                  if (facingMode === 'user') {
                    setFacingMode('environment');
                  } else if (facingMode === 'environment') {
                    setFacingMode('user');
                  }
                }}
              />
            </button>
          </div>
        </>
      </div>
      <input
        type="file"
        className="hidden"
        accept="image/*"
        ref={imgFileInputRef}
        onChange={handleChangeImgFile}
      />
    </div>

  );
}
