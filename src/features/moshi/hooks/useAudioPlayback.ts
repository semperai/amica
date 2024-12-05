import { useRef } from "react";

export const useAudioPlayback = (audioContext: AudioContext) => {
    const scheduledEndTimeRef = useRef<number>(0);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null); // Audio source node

    const scheduleAudioPlayback = async (
        newAudioData: Float32Array,
        nowTime: number | undefined,
        viewer: any
    ) => {
        const sampleRate = audioContext.sampleRate;
        const newBuffer = audioContext.createBuffer(1, newAudioData.length, sampleRate);
        newBuffer.copyToChannel(newAudioData, 0);

        const sourceNode = viewer.model?._lipSync?.audio.createBufferSource();
        sourceNode.buffer = newBuffer;
        sourceNode.connect(viewer.model?._lipSync?.audio.destination!);
        sourceNode.connect(viewer.model?._lipSync?.analyser!);

        const startTime = Math.max(scheduledEndTimeRef.current, nowTime || 0);
        sourceNode.start(startTime);

        scheduledEndTimeRef.current = startTime + newBuffer.duration;

        if (sourceNodeRef.current && sourceNodeRef.current.buffer) {
            const currentEndTime = scheduledEndTimeRef.current;  // Use the manual tracking of the end time
            if (currentEndTime <= nowTime!) {
                sourceNodeRef.current.disconnect();
            }
        }
        sourceNodeRef.current = sourceNode!;
    };

    return { scheduleAudioPlayback, sourceNodeRef };
};
