import * as THREE from "three";
import { useContext, useCallback, useState } from "react";
import { ViewerContext } from "@/features/vrmViewer/viewerContext";
import { buildUrl } from "@/utils/buildUrl";
import { config } from "@/utils/config";
import { useVrmStoreContext } from "@/features/vrmStore/vrmStoreContext";
import isTauri from "@/utils/isTauri";
import { invoke } from "@tauri-apps/api/tauri";
import { ChatContext } from "@/features/chat/chatContext";
import clsx from "clsx";

export default function VrmViewer({ chatMode }: { chatMode: boolean }) {
  const { chat: bot } = useContext(ChatContext);
  const { viewer } = useContext(ViewerContext);
  const { getCurrentVrm, vrmList, vrmListAddFile, isLoadingVrmList } =
    useVrmStoreContext();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState("");
  const [loadingError, setLoadingError] = useState(false);
  const isVrmLocal = "local" == config("vrm_save_type");

  viewer.resizeChatMode(chatMode);
  window.addEventListener("resize", () => {
    viewer.resizeChatMode(chatMode);
  });

  const canvasRef = useCallback(
    (canvas: HTMLCanvasElement) => {
      if (canvas && (!isVrmLocal || !isLoadingVrmList)) {
        new Promise(async (resolve, reject) => {
          await viewer.setup(canvas);

          try {
            const currentVrm = getCurrentVrm();
            if (!currentVrm) {
              setIsLoading(true);
              resolve(false);
            } else {
              // Temp Disable : WebXR
              // await viewer.loadScenario(config('scenario_url'));
              await viewer.loadVrm(buildUrl(currentVrm.url),
              (progress) => { console.log(`loading model ${progress}`);}
              );
              resolve(true);
            }
          } catch (e) {
            reject(e);
          }
        })
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
          }/* else if (file_type === "glb") {
            viewer.loadRoom(URL.createObjectURL(file));
          }*/
        });
      }
    },
    [
      vrmList.findIndex((value) =>
        value.hashEquals(getCurrentVrm()?.getHash() || ""),
      ) < 0,
      viewer,
    ],
  );

  return (
    <div
      className={clsx(
        "z-1 fixed left-0 top-0 h-full w-full",
        chatMode ? "left-[65%] top-[50%]" : "left-0 top-0",
      )}>
      <canvas ref={canvasRef} className={"h-full w-full"}></canvas>
      {isLoading && (
        <div
          className={
            "absolute left-0 top-0 flex h-full w-full items-center justify-center bg-black bg-opacity-50"
          }>
          <div className={"text-2xl text-white"}>{loadingProgress}</div>
        </div>
      )}
      {loadingError && (
        <div
          className={
            "absolute left-0 top-0 flex h-full w-full items-center justify-center bg-black bg-opacity-50"
          }>
          <div className={"text-2xl text-white"}>
            Error loading VRM model...
          </div>
        </div>
      )}
    </div>
  );
}
