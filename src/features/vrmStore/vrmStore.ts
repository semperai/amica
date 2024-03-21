import { hashCode, thumbPrefix } from "@/components/settings/common";
import { VrmData } from "./vrmData";
import { VrmDataProvider } from "./vrmDataProvider";
import VrmDbModel from "./vrmDbModel";
import { vrmList } from '@/paths';

export class VrmStore {
    public loadedVrmList: VrmData[] = [];
    
    private vrmDataProvider: VrmDataProvider;
    private thumbImagePlaceholderUrl: string = '/vrm/thumb-placeholder.jpg';

    constructor() {
        this.vrmDataProvider = new VrmDataProvider();
        this.loadedVrmList = vrmList.map((url: string) => {
            return new VrmData(url, url, `${thumbPrefix(url)}.jpg`);
        });
    }

    public loadFromLocalStorage = async (): Promise<void> => {
        return this.vrmDataProvider
            .getItems()
            .then(this.vrmDataArrayFromVrmDbModelArray)
            .then((vrmDataArray: VrmData[]) => {
                this.loadedVrmList = this.loadedVrmList.concat(vrmDataArray);
                console.log("Updated VRM list from localStorage:\n");
                console.log(this.loadedVrmList);
            });
    }

    public getItemByHash(vrmHash: string): VrmData | undefined {
        return this.loadedVrmList.find(vrm => vrm.getHash() == vrmHash);
    }

    public updateVrmThumb = (url: string, thumbBlob: Blob): void => {
        const vrm = this.loadedVrmList.find((vrm: VrmData) => { return (vrm.url == url); });
        const thumbUrl = window.URL.createObjectURL(thumbBlob);
        if (vrm instanceof VrmData) {
            vrm.thumbUrl = thumbUrl;
            this.loadedVrmList = [...this.loadedVrmList];
            console.log("Updated VRM list from updateVrmThumb:\n");
            console.log(this.loadedVrmList);
            let reader = new FileReader();
            reader.readAsDataURL(thumbBlob);
            this.blobToBase64(thumbBlob).then((data: string) => {
                this.vrmDataProvider.updateItemThumb(vrm.getHash(), data);
            });
        }
    }
    
    public addItem = (file: File): string => {
        const blob = new Blob([file], { type: "application/octet-stream" });
        const url = window.URL.createObjectURL(blob);
        this.blobToBase64(blob).then((data: string) => {
            const hash = hashCode(data);
            if (this.loadedVrmList.findIndex(vrm => vrm.hashEquals(hash)) == -1) {
                this.loadedVrmList = [...this.loadedVrmList, new VrmData(hash, url, this.thumbImagePlaceholderUrl)];
                console.log("Updated VRM list from addItem:\n");
                console.log(this.loadedVrmList);
                this.vrmDataProvider.addItem(hash, data);
            }
        });
        return url;
    }

    private vrmDataArrayFromVrmDbModelArray = async (vrms: VrmDbModel[]): Promise<VrmData[]> => {
        const promiseArray = vrms.map((vrmDbModel: VrmDbModel): Promise<VrmData> => {
            return this.VrmDbModelToVrmData(vrmDbModel);
        });
        return Promise.all(promiseArray).then((vrmDataArray: VrmData[]) => { return vrmDataArray; });
    }

    private VrmDbModelToVrmData = async (vrmDbModel: VrmDbModel): Promise<VrmData> => {
        const vrmBlob = await this.base64ToBlob(vrmDbModel.vrmData);
        const vrmBlobUrl = window.URL.createObjectURL(vrmBlob);
        let thumbBlobUrl: string;
        if (!vrmDbModel.thumbData || !vrmDbModel.thumbData.length) {
            thumbBlobUrl = this.thumbImagePlaceholderUrl
        } else {
            const thumbBlob = await this.base64ToBlob(vrmDbModel.thumbData);
            thumbBlobUrl = window.URL.createObjectURL(thumbBlob);
        }
        return new Promise((resolve, reject) => {
            resolve(new VrmData(vrmDbModel.hash, vrmBlobUrl, thumbBlobUrl)); 
        });
    }

    private blobToBase64 = async (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) =>
        {
            let reader = new FileReader();

            reader.onload = () => {
                if (reader.result && typeof reader.result == "string")
                    resolve(reader.result);
            }
            reader.onerror = reject;
            reader.readAsDataURL(blob); // converts the blob to base64 and calls onload
        });
    }

    private base64ToBlob = async (data: string): Promise<Blob> => {
        return fetch(data)
            .then(res => res.blob());
    }
};