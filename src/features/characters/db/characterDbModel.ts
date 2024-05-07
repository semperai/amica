export default class CharacterDbModel {
    public id: number;
    public tag: string;
    public name: string;
    public vrmHash: string;
    public bgUrl: string;
    public bgColor: string;
    public youtubeVideoId: string;
    public animationUrl: string;

    constructor(id: number, tag: string, name: string, vrmHash: string, bgUrl: string, bgColor: string, youtubeVideoId: string, animationUrl: string) {
        this.id = id;
        this.tag = tag;
        this.name = name;
        this.vrmHash = vrmHash;
        this.bgUrl = bgUrl;
        this.bgColor = bgColor;
        this.youtubeVideoId = youtubeVideoId;
        this.animationUrl = animationUrl;
    }
}