import { useContext, useCallback, useState } from "react";
import { ViewerContext } from "@/features/vrmViewer/viewerContext";
import { buildUrl } from "@/utils/buildUrl";
import { config } from "@/utils/config";
import { VrmStoreContext } from "@/features/vrmStore/vrmStoreContext";

export default function VrmViewer() {
  const { viewer } = useContext(ViewerContext);
  const { vrmStore } = useContext(VrmStoreContext);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(false);

  const canvasRef = useCallback(
    (canvas: HTMLCanvasElement) => {
      if (canvas) {
        viewer.setup(canvas);
        const vrmHash = config("vrm_hash");
        (new Promise(async (resolve, reject) => {
          try {
            await vrmStore.loadFromLocalStorage();
            const vrm = vrmStore.getItemByHash(vrmHash);
            if (vrm) {
              await viewer.loadVrm(buildUrl(vrm.url));
              resolve(true);
            }
            reject("cant find vrm in localStorage");
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
            const url = vrmStore.addItem(file);
            viewer.loadVrm(url)
              .then(() => {return new Promise(resolve => setTimeout(resolve, 300));})
              .then(() => {
                viewer.getScreenshotBlob((thumbBlob: Blob | null) => {
                  if (!thumbBlob)
                    return;
                  vrmStore.updateVrmThumb(url, thumbBlob);
                });
              });
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
