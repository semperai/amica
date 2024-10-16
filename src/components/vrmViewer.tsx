import { useContext, useCallback, useState } from "react";
import { ViewerContext } from "@/features/vrmViewer/viewerContext";
import { buildUrl } from "@/utils/buildUrl";
import { config } from "@/utils/config";
import { useVrmStoreContext } from "@/features/vrmStore/vrmStoreContext";
import isTauri from "@/utils/isTauri";
import { invoke } from "@tauri-apps/api/tauri";
import { ChatContext } from "@/features/chat/chatContext";
import clsx from "clsx";


export default function VrmViewer({chatMode}:{chatMode: boolean}) {
  const { chat: bot } = useContext(ChatContext);
  const { viewer } = useContext(ViewerContext);
  const { getCurrentVrm, vrmList, vrmListAddFile, isLoadingVrmList } = useVrmStoreContext();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(false);
  const isVrmLocal = 'local' == config("vrm_save_type");

  
  viewer.resizeChatMode(chatMode); 
  window.addEventListener("resize", () => {
    viewer.resizeChatMode(chatMode);
  });

  const canvasRef = useCallback(
    (canvas: HTMLCanvasElement) => {
      if (canvas && (!isVrmLocal || !isLoadingVrmList)) {
        (new Promise(async (resolve, reject) => {
          await viewer.setup(canvas);

          try {
            const currentVrm = getCurrentVrm();
            if (!currentVrm) {
              setIsLoading(true);
              resolve(false);
            } else {
              await viewer.loadVrm(buildUrl(currentVrm.url));
              // await viewer.loadRoom(buildUrl('/room/myroom.glb'));
              // await viewer.loadRoom(buildUrl('/room/bathroom.glb'));
              // await viewer.loadRoom(buildUrl('/room/basic_house.glb'));
              // await viewer.loadSplat(buildUrl('/splats/garden.ksplat'));
              // await viewer.loadSplat(buildUrl('/splats/bonsai_trimmed.ksplat'));
              resolve(true);
            }
          } catch (e) {
            reject(e);
          }
        }))
        .then((loaded) => {
          if (loaded) {
            console.log("vrm loaded");
            setLoadingError(false);
            setIsLoading(false);
            if (isTauri()) invoke("close_splashscreen");
          }
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
    [vrmList.findIndex(value => value.hashEquals(getCurrentVrm()?.getHash() || "")) < 0, viewer]
  );

  return (
    <div className={clsx(
      "fixed top-0 left-0 w-full h-full z-1",
      chatMode ? "top-[50%] left-[65%]" : "top-0 left-0",
    )}>
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
