export default class VrmDbModel {
    public hash: string;
    public saveType: 'local' | 'web';
    public vrmData: string;
    public vrmUrl: string;
    public thumbData: string;

    constructor(hash: string, saveType: 'local' | 'web', vrmData: string, vrmUrl: string, thumbData?: string) {
        this.hash = hash;
        this.saveType = saveType;
        this.vrmData = vrmData;
        this.vrmUrl = vrmUrl;
        this.thumbData = thumbData ?? "";
    }
}