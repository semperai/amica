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
    isLoadingVrmList: false, setIsLoadingVrmList: () => {}
});

export const VrmStoreProvider = ({ children }: PropsWithChildren<{}>): JSX.Element => {
    const [isLoadingVrmList, setIsLoadingVrmList] = useState(true);
    const [loadedVrmList, vrmListDispatch] = useReducer(vrmStoreReducer, vrmInitList);
    const vrmListAddFile = (file: File, viewer: Viewer) => {
        vrmListDispatch({ type: VrmStoreActionType.addItem, itemFile: file, callback: (callbackProp: AddItemCallbackType) => {
            viewer.loadVrm(callbackProp.url, (progress: string) => {
              // TODO handle loading progress
            })
              .then(() => {return new Promise(resolve => setTimeout(resolve, 300));})
              .then(() => {
                updateConfig("vrm_url", callbackProp.url);
                updateConfig("vrm_hash", callbackProp.hash);
                updateConfig("vrm_save_type", "local");
                viewer.getScreenshotBlob((thumbBlob: Blob | null) => {
                  if (!thumbBlob) return;
                  vrmListDispatch({ type: VrmStoreActionType.updateVrmThumb, url: callbackProp.url, thumbBlob, vrmList: callbackProp.vrmList, callback: (updatedThumbVrmList: VrmData[]) => {
                    vrmListDispatch({ type: VrmStoreActionType.setVrmList, vrmList: updatedThumbVrmList });
                  }});
                });
              });
        }});
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
        <VrmStoreContext.Provider value={{getCurrentVrm: getCurrentVrm, vrmList: loadedVrmList, vrmListAddFile, isLoadingVrmList, setIsLoadingVrmList}}>
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
