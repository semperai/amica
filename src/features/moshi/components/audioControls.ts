interface Recorder {
    start: () => Promise<void>;
    stop: () => void;
    ondataavailable: (arrayBuffer: ArrayBuffer) => void;
    setRecordingGain: (gain: number) => void;
}

export class AudioControls {
    private recorderInstance: Recorder | null = null;
    private muted = true;
    
    constructor() {
    }

    public getRecorder() {
        return this.recorderInstance;
    }

    public setRecorder(recorder: Recorder | null) {
        this.recorderInstance = recorder;
        this.muted = false;
        this.recorderInstance?.setRecordingGain(1);
    }

    public toggleMute() {
        if (!this.recorderInstance) return;
        this.muted = !this.muted;
        this.recorderInstance.setRecordingGain(this.muted ? 0 : 1);
        console.log("muted moshi mic: ", this.muted)
    }

    public isMuted() {
        return this.muted;
    }
}

