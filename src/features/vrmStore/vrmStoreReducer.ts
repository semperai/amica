import { hashCode } from "@/components/settings/common";
import { VrmData } from "./vrmData";
import { vrmDataProvider } from "./vrmDataProvider";
import VrmDbModel from "./vrmDbModel";
import "@/utils/blobDataUtils";
import { Base64ToBlob, BlobToBase64 } from "@/utils/blobDataUtils";

export type VrmDispatchAction = {
    type: VrmStoreActionType;
    itemFile?: File;
    url?: string;
    thumbBlob?: Blob;
    vrmList?: VrmData[];
    callback?: (props: any) => any;
};

export enum VrmStoreActionType {
    addItem,
    updateVrmThumb,
    setVrmList,
    loadFromLocalStorage
};

export const vrmStoreReducer = (state: VrmData[], action: VrmDispatchAction): VrmData[] => {
    let newState = state;
    switch (action.type) {
        case VrmStoreActionType.addItem:
            if (action.itemFile && action.callback)
                newState = addItem(state, action.itemFile, action.callback);
            break;
        case VrmStoreActionType.updateVrmThumb:
            newState = updateVrmThumb(state, action);
        case VrmStoreActionType.setVrmList:
            if (action.vrmList && action.vrmList.length)
                newState = action.vrmList;
        case VrmStoreActionType.loadFromLocalStorage:
            if (action.vrmList && action.callback)
                newState = LoadFromLocalStorage(action)
        default:
            break;
    }
    return newState;
};

export type AddItemCallbackType = {
    url: string,
    vrmList: VrmData[],
    hash: string
}

const addItem = (vrmList: VrmData[], file: File, callback: (prop: AddItemCallbackType) => any): VrmData[] => {
    let loadedVrmList = vrmList;
    const blob = new Blob([file], { type: "application/octet-stream" });
    const url = window.URL.createObjectURL(blob);
    BlobToBase64(blob).then((data: string) => {
        const hash = hashCode(data);
        if (loadedVrmList.findIndex((vrm: VrmData) => vrm.hashEquals(hash)) == -1) {
            loadedVrmList = [...loadedVrmList, new VrmData(hash, url, '/vrm/thumb-placeholder.jpg', 'local')];
            vrmDataProvider.addItem(hash, 'local', data);
            callback({ url, vrmList: loadedVrmList, hash });
        }
    });
    return vrmList;
};

const updateVrmThumb = (vrmList: VrmData[], action: VrmDispatchAction): VrmData[] => {
    if (!(action.url && action.thumbBlob && action.vrmList))
        return vrmList;
    let newVrmList = new Array<VrmData>(...action.vrmList);
    const vrm = newVrmList.find((vrm: VrmData) => { return (vrm.url == action.url); });
    const thumbUrl = window.URL.createObjectURL(action.thumbBlob);
    if (vrm instanceof VrmData) {
        vrm.thumbUrl = thumbUrl;
        let reader = new FileReader();
        reader.readAsDataURL(action.thumbBlob);
        BlobToBase64(action.thumbBlob).then((data: string) => {
            vrmDataProvider.updateItemThumb(vrm.getHash(), data);
            if (action.callback) action.callback(newVrmList);
        });
    }
    return vrmList;
};

const LoadFromLocalStorage = (action: VrmDispatchAction): VrmData[] => {
    vrmDataProvider
        .getItems()
        .then(VrmDataArrayFromVrmDbModelArray)
        .then((vrmDataArray: VrmData[]): VrmData[] => {
            let vrmList = new Array<VrmData>;
            if (action.vrmList) vrmList = action.vrmList;
            let newList = vrmList.concat(vrmDataArray);
            newList = newList.filter((value, index, array) => {
                return index == array.findIndex((vrm) => { return vrm.getHash() == value.getHash();});
            });
            return newList;
        })
        .then((data: VrmData[]) => { if (action.callback && data) action.callback(data); });

    return action.vrmList || new Array<VrmData>;
};

const VrmDataArrayFromVrmDbModelArray = async (vrms: VrmDbModel[]): Promise<VrmData[]> => {
    const promiseArray = vrms.map((vrmDbModel: VrmDbModel): Promise<VrmData> => {
        return VrmDbModelToVrmData(vrmDbModel);
    });
    return Promise.all(promiseArray).then((vrmDataArray: VrmData[]) => { return vrmDataArray; });
};

const VrmDbModelToVrmData = async (vrmDbModel: VrmDbModel): Promise<VrmData> => {
    let thumbUrl: string;
    let vrmUrl: string;

    if (vrmDbModel.saveType == 'local') {
        const vrmBlob = await Base64ToBlob(vrmDbModel.vrmData);
        vrmUrl = window.URL.createObjectURL(vrmBlob);
    } else {
        vrmUrl = vrmDbModel.vrmUrl;
    }

    if (!vrmDbModel.thumbData || !vrmDbModel.thumbData.length) {
        thumbUrl = '/vrm/thumb-placeholder.jpg';
    } else {
        const thumbBlob = await Base64ToBlob(vrmDbModel.thumbData);
        thumbUrl = window.URL.createObjectURL(thumbBlob);
    }
    
    return new Promise((resolve, reject) => {
        resolve(new VrmData(vrmDbModel.hash, vrmUrl, thumbUrl, vrmDbModel.saveType)); 
    });
};