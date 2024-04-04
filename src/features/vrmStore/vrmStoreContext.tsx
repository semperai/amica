import { Dispatch, PropsWithChildren, createContext, useContext, useEffect, useReducer } from "react";
import { VrmData } from "./vrmData";
import { vrmList } from "@/paths";
import { thumbPrefix } from "@/components/settings/common";
import { VrmDispatchAction, VrmStoreActionType, vrmListReducer } from "./vrmStoreReducer";

interface VrmStoreContextType {
    vrmList: VrmData[];
    vrmListDispatch: Dispatch<VrmDispatchAction>;
};

const vrmInitList = vrmList.map((url: string) => {
    return new VrmData(url, url, `${thumbPrefix(url)}.jpg`);
});

export const VrmStoreContext = createContext<VrmStoreContextType>({ vrmList: vrmInitList, vrmListDispatch: () => {} });

export const VrmStoreProvider = ({ children }: PropsWithChildren<{}>): JSX.Element => {
    const [loadedVrmList, vrmListDispatch] = useReducer(vrmListReducer, vrmInitList);

    useEffect(() => {
        vrmListDispatch({ type: VrmStoreActionType.loadFromLocalStorage, vrmList: vrmInitList, callback: (updatedVmList: VrmData[]) => {
            vrmListDispatch({ type: VrmStoreActionType.setVrmList, vrmList: updatedVmList });
        }});
    }, []);

    return (
        <VrmStoreContext.Provider value={{vrmList: loadedVrmList, vrmListDispatch}}>
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