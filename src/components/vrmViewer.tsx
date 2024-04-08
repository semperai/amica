import { useContext, useCallback, useState } from "react";
import { ViewerContext } from "@/features/vrmViewer/viewerContext";
import { buildUrl } from "@/utils/buildUrl";
import { config } from "@/utils/config";
import { useVrmStoreContext } from "@/features/vrmStore/vrmStoreContext";
import { VrmData } from "@/features/vrmStore/vrmData";
import isTauri from "@/utils/isTauri";
import { invoke } from "@tauri-apps/api/tauri";


export default function VrmViewer() {
  const { viewer } = useContext(ViewerContext);
  const { vrmList, vrmListAddFile, isLoadingVrmList } = useVrmStoreContext();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(false);
  const vrmHash = config("vrm_hash");

  const canvasRef = useCallback(
    (canvas: HTMLCanvasElement) => {
      if (canvas && !isLoadingVrmList) {
        viewer.setup(canvas);
        
        (new Promise(async (resolve, reject) => {
          try {
            const vrm = vrmList.find(( vrm: VrmData ) => vrm.getHash() == vrmHash);
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
          setLoadingError(false);
          setIsLoading(false);
          if (isTauri()) invoke("close_splashscreen");
        })
        .catch((e) => {
          console.error("vrm loading error", e);
          setLoadingError(true);
          setIsLoading(false);
          if (isTauri()) invoke("close_splashscreen");
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
            vrmListAddFile(file, viewer);
          }
        });
      }
    },
    [vrmList.findIndex(value => value.hashEquals(vrmHash)), viewer]
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
