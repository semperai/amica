export class VrmData{
    public url: string;
    public thumbUrl: string;
    public saveType: "local" | "web";
    private hash: string;

    constructor(hash:string, url: string, thumbUrl?: string, saveType: "local" | "web" = 'web') {
        this.url = url;
        this.thumbUrl = thumbUrl ?? "";
        this.hash = hash;
        this.saveType = saveType;
    }

    public hashEquals(hash: string) {
        return (this.hash == hash);
    }

    public getHash(): string {
        return this.hash;
    }
};