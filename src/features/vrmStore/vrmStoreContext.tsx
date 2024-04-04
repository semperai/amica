import { PropsWithChildren, createContext, useContext, useEffect, useReducer } from "react";
import { VrmData } from "./vrmData";
import { vrmList } from "@/paths";
import { thumbPrefix } from "@/components/settings/common";
import { AddItemCallbackType, VrmStoreActionType, vrmListReducer } from "./vrmStoreReducer";
import { Viewer } from "../vrmViewer/viewer";
import { updateConfig } from "@/utils/config";

interface VrmStoreContextType {
    vrmList: VrmData[];
    vrmListAddFile: (file: File, viewer: Viewer) => void;
};

const vrmInitList = vrmList.map((url: string) => {
    return new VrmData(url, url, `${thumbPrefix(url)}.jpg`);
});

export const VrmStoreContext = createContext<VrmStoreContextType>({ vrmList: vrmInitList, vrmListAddFile: () => {} });

export const VrmStoreProvider = ({ children }: PropsWithChildren<{}>): JSX.Element => {
    const [loadedVrmList, vrmListDispatch] = useReducer(vrmListReducer, vrmInitList);
    const vrmListAddFile = (file: File, viewer: Viewer) => {
        vrmListDispatch({ type: VrmStoreActionType.addItem, itemFile: file, callback: (callbackProp: AddItemCallbackType) => {
            viewer.loadVrm(callbackProp.url)
              .then(() => {return new Promise(resolve => setTimeout(resolve, 300));})
              .then(() => {
                updateConfig("vrm_hash", callbackProp.hash);
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
        }});
    }, []);

    return (
        <VrmStoreContext.Provider value={{vrmList: loadedVrmList, vrmListAddFile}}>
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