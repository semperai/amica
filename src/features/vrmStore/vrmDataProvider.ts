import { VrmDexie } from "./vrmDb";
import VrmDbModel from "./vrmDbModel";
import { db } from "./vrmDb";

export class VrmDataProvider {
    private db: VrmDexie;

    constructor() {
        this.db = db;
    }

    componentWillUnmount() {
        this.db.close();
    }
    
    public addItem(hash: string, vrmData: string): void {
        this.db.vrms.put(new VrmDbModel(hash, vrmData));
    }

    public async getItems(): Promise<VrmDbModel[]> {
        return this.db.vrms.toArray();
    }

    public updateItemThumb(hash: string, vrmThumbData: string): void {
        this.db.vrms.where("hash").equals(hash).modify({ thumbData: vrmThumbData });
    }
}