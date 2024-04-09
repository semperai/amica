export default class VrmDbModel {
    public hash: string;
    public vrmData: string;
    public thumbData: string;

    constructor(hash: string, vrmData: string, thumbData?: string) {
        this.hash = hash;
        this.vrmData = vrmData;
        this.thumbData = thumbData ?? "";
    }
}