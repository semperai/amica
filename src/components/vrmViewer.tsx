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
              // await viewer.loadScenario('/scenarios/test1.js');
              await viewer.loadScenario('/scenarios/test2.js');

              // await viewer.loadVrm(
              //   buildUrl(currentVrm.url),
              //   setLoadingProgress,
              // );

              // await viewer.loadRoom(
              //   buildUrl('/room/japanese_bridge_garden.glb'),
              //   new THREE.Vector3(0, 0, 0),
              //   new THREE.Euler(0, 0, 0),
              //   new THREE.Vector3(1, 1, 1),
              // );

              // await viewer.loadRoom(
              //   buildUrl('/room/japanese_bridge_garden.glb'),
              //   new THREE.Vector3(0, 0, 0),
              //   new THREE.Euler(0, 0, 0),
              //   new THREE.Vector3(1, 1, 1),
              // );

              // DOESNT LOAD COLORS
              // await viewer.loadRoom(
              //   buildUrl('/room/japanese_bridge_garden.glb'),
              //   new THREE.Vector3(0, 0, 0),
              //   new THREE.Euler(0, 0, 0),
              //   new THREE.Vector3(1, 1, 1),
              // );

              // TOO SLOW (but not if transparency etc disabled)
              // await viewer.loadRoom(
              //   buildUrl('/room/autumn_house.glb'),
              //   new THREE.Vector3(0, -0.35, -0.2),
              //   new THREE.Euler(0, -Math.PI/2, 0),
              //   new THREE.Vector3(0.2, 0.2, 0.2),
              // );

              // PERFECT
              // await viewer.loadRoom(
              //   `${process.env.NEXT_PUBLIC_AMICA_STORAGE_URL}/8d8254f0170994eb26f31b62feecdad79d19bbb1bfbbd7e477acda418921099d`,
              //   // buildUrl('/room/low_poly_winter_scene.glb'),
              //   new THREE.Vector3(1, 0, -0.5),
              //   new THREE.Euler(0, 0, 0),
              //   new THREE.Vector3(1, 1, 1),
              // );

              // OK
              // await viewer.loadRoom(
              //   `${process.env.NEXT_PUBLIC_AMICA_STORAGE_URL}/e8fc9e2a72e9336dde3635cbdebd0867c4640b72b519dcc5066ba348daac8af5`,
              //   new THREE.Vector3(0, 0.2, -2),
              //   new THREE.Euler(0, 0, 0),
              //   new THREE.Vector3(0.016, 0.016, 0.016),
              // );

              // OK
              // await viewer.loadRoom(
              //   `${process.env.NEXT_PUBLIC_AMICA_STORAGE_URL}/7aa9bd8033e3a51a69ce1bb26864e0f7e1d17caa92303f0b15d60f027b869557`,
              //   new THREE.Vector3(0, -0.05, -0.1),
              //   new THREE.Euler(0, 0, 0),
              //   new THREE.Vector3(0.7, 0.7, 0.7),
              // );
              
              // await viewer.loadRoom(buildUrl('/room/bathroom.glb'));
              // await viewer.loadRoom(buildUrl('/room/basic_house.glb'));
              // await viewer.loadSplat(buildUrl('/splats/garden.ksplat'));
              // await viewer.loadSplat(buildUrl('/splats/bonsai_trimmed.ksplat'));
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
