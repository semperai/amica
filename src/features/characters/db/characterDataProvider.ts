import { AmicaDexie } from "../../indexedDb/amicaDb";
import CharacterDbModel from "./characterDbModel";
import { db } from "../../indexedDb/amicaDb";

export class CharacterDataProvider {
    private db: AmicaDexie;

    constructor() {
        this.db = db;
    }

    componentWillUnmount() {
        this.db.close();
    }
    
    public create(tag: string, name: string, vrmHash: string, bgUrl: string, bgColor: string, youtubeVideoID: string, animationUrl: string): Promise<CharacterDbModel> {
        return this.db.characters.add(new CharacterDbModel(1, tag, name, vrmHash, bgUrl, bgColor, youtubeVideoID, animationUrl));
    }

    public async getItems(): Promise<CharacterDbModel[]> {
        return this.db.characters.toArray();
    }

    public async getItem(id: number): Promise<CharacterDbModel | undefined> {
        return this.db.characters.get({ "id": id });
    }

    public async update(id: number, tag: string, name?: string, vrmHash?: string, bgUrl?: string, bgColor?: string, youtubeVideoId?: string, animationUrl?: string): Promise<CharacterDbModel | undefined> {
        this.db.characters.where("id").equals(id).modify({tag, name, vrmHash, bgUrl, bgColor, youtubeVideoId, animationUrl});
        return this.db.characters.get(id);
    }

    public async delete(id: number): Promise<void> {
        return this.db.characters.delete({ "id": id });
    }
}

export const characterDataProvider = new CharacterDataProvider();