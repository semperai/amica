import { useContext, useCallback, useState } from "react";
import { ViewerContext } from "@/features/vrmViewer/viewerContext";
import { buildUrl } from "@/utils/buildUrl";
import { config } from "@/utils/config";

export default function VrmViewer() {
  const { viewer } = useContext(ViewerContext);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(false);

  const canvasRef = useCallback(
    (canvas: HTMLCanvasElement) => {
      if (canvas) {
        viewer.setup(canvas);
        const vrmUrl = config("vrm_url");
        (new Promise(async (resolve, reject) => {
          try {
            await viewer.loadVrm(buildUrl(vrmUrl));
            resolve(true);
          } catch (e) {
            reject(e);
          }
        }))
        .then(() => {
          console.log("vrm loaded");
          setIsLoading(false);
        })
        .catch((e) => {
          console.error("vrm loading error", e);
          setLoadingError(true);
          setIsLoading(false);
        });


        // Replace VRM with Drag and Drop
        canvas.addEventListener("dragover", function (event) {
          event.preventDefault();
        });

        canvas.addEventListener("drop", function (event) {
          event.preventDefault();

          const files = event.dataTransfer?.files;
          if (!files) {
            return;
          }

          const file = files[0];
          if (!file) {
            return;
          }

          const file_type = file.name.split(".").pop();
          if (file_type === "vrm") {
            const blob = new Blob([file], { type: "application/octet-stream" });
            const url = window.URL.createObjectURL(blob);
            viewer.loadVrm(url);
          }
        });
      }
    },
    [viewer]
  );

  return (
    <div className={"fixed top-0 left-0 w-full h-full z-1"}>
      <canvas ref={canvasRef} className={"h-full w-full"}></canvas>
      {isLoading && (
        <div className={"absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center"}>
          <div className={"text-white text-2xl"}>Loading...</div>
        </div>
      )}
      {loadingError && (
        <div className={"absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center"}>
          <div className={"text-white text-2xl"}>Error loading VRM model...</div>
        </div>
      )}
    </div>
  );
}
