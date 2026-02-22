import { Dispatch, PropsWithChildren, SetStateAction, createContext, useContext, useEffect, useReducer, useState } from "react";
import { VrmData } from "./vrmData";
import { vrmList } from "@/paths";
import { thumbPrefix } from "@/components/settings/common";
import { AddItemCallbackType, VrmStoreActionType, vrmStoreReducer } from "./vrmStoreReducer";
import { Viewer } from "../vrmViewer/viewer";
import { config, updateConfig } from "@/utils/config";

interface VrmStoreContextType {
    getCurrentVrm: () => VrmData | undefined;
    vrmList: VrmData[];
    vrmListAddFile: (file: File, viewer: Viewer) => void;
    addVrmFromStored: (hash: string, url: string) => void;
    isLoadingVrmList: boolean;
    setIsLoadingVrmList: Dispatch<SetStateAction<boolean>>;
};

const vrmInitList = vrmList.map((url: string) => {
    return new VrmData(url, url, `${thumbPrefix(url)}.jpg`, 'web');
});

export const VrmStoreContext = createContext<VrmStoreContextType>({
    getCurrentVrm: () => {return undefined;},
    vrmList: vrmInitList,
    vrmListAddFile: () => {},
    addVrmFromStored: () => {},
    isLoadingVrmList: false, setIsLoadingVrmList: () => {}
});

export const VrmStoreProvider = ({ children }: PropsWithChildren<{}>): JSX.Element => {
    const [isLoadingVrmList, setIsLoadingVrmList] = useState(true);
    const [loadedVrmList, vrmListDispatch] = useReducer(vrmStoreReducer, vrmInitList);
    const vrmListAddFile = (file: File, viewer: Viewer) => {
        console.log("[VRM] vrmListAddFile вызван", { fileName: file.name, size: file.size });
        vrmListDispatch({ type: VrmStoreActionType.addItem, itemFile: file, callback: (callbackProp: AddItemCallbackType) => {
            console.log("[VRM] addItem callback: blob → url готов, загружаем в viewer", callbackProp.url);
            viewer.loadVrm(callbackProp.url, (progress: string) => {
              console.log("[VRM] loadVrm progress:", progress);
            })
              .then(() => {return new Promise(resolve => setTimeout(resolve, 300));})
              .then(() => {
                console.log("[VRM] loadVrm завершён, сохраняем config и делаем скриншот");
                updateConfig("vrm_url", callbackProp.url);
                updateConfig("vrm_hash", callbackProp.hash);
                updateConfig("vrm_save_type", "local");
                viewer.getScreenshotBlob((thumbBlob: Blob | null) => {
                  if (!thumbBlob) {
                    console.warn("[VRM] getScreenshotBlob вернул null");
                    return;
                  }
                  console.log("[VRM] Скриншот получен, обновляем thumb в списке");
                  vrmListDispatch({ type: VrmStoreActionType.updateVrmThumb, url: callbackProp.url, thumbBlob, vrmList: callbackProp.vrmList, callback: (updatedThumbVrmList: VrmData[]) => {
                    vrmListDispatch({ type: VrmStoreActionType.setVrmList, vrmList: updatedThumbVrmList });
                  }});
                });
              })
              .catch((err) => {
                console.error("[VRM] Ошибка при загрузке VRM в viewer:", err);
              });
        }});
    };

    const addVrmFromStored = (hash: string, url: string) => {
        vrmListDispatch({
            type: VrmStoreActionType.appendVrm,
            vrmData: new VrmData(hash, url, "/vrm/thumb-placeholder.jpg", "local"),
        });
    };

    useEffect(() => {
        vrmListDispatch({ type: VrmStoreActionType.loadFromLocalStorage, vrmList: vrmInitList, callback: (updatedVmList: VrmData[]) => {
            vrmListDispatch({ type: VrmStoreActionType.setVrmList, vrmList: updatedVmList });
            setIsLoadingVrmList(false);
        }});
    }, []);

    const getCurrentVrm = () => {
        return config('vrm_save_type') == 'local' ? loadedVrmList.find(vrm => vrm.getHash() == config('vrm_hash') ) : loadedVrmList.find(vrm => vrm.url == config('vrm_url') );
    }

    return (
        <VrmStoreContext.Provider value={{getCurrentVrm: getCurrentVrm, vrmList: loadedVrmList, vrmListAddFile, addVrmFromStored, isLoadingVrmList, setIsLoadingVrmList}}>
            {children}
        </VrmStoreContext.Provider>
    );
};

export const useVrmStoreContext = () => {
    const context = useContext(VrmStoreContext);

    if (!context) {
        throw new Error("useVrmStoreContext must be used inside the VrmStoreProvider");
    }

    return context;
};
