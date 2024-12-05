import React, { useState, useEffect, useRef, useContext } from "react";
import { ChatContext } from "@/features/chat/chatContext";
import { ViewerContext } from "@/features/vrmViewer/viewerContext";
import { Role } from "@/features/chat/messages";
import { useWebSocket } from "@/features/moshi2/hooks/useWebsocket";
import { useAudioDecoder } from "@/features/moshi2/hooks/useAudioDecoder";
import { useAudioPlayback } from "@/features/moshi2/hooks/useAudioPlayback";
import { getBaseURL } from "@/features/moshi2/utils/socketUtils";
import AudioControl from "@/features/moshi2/components/AudioControls";
import Recorder from 'opus-recorder'

export interface Recorder {
    start: () => Promise<void>;
    stop: () => void;
    ondataavailable: (arrayBuffer: ArrayBuffer) => void;
    setRecordingGain: (gain: number) => void;
}

interface MoshiProps {
    setAssistantText: (message: string) => void;
}

export function Moshi({ setAssistantText }: {setAssistantText: (message: string) => void }) {
    const [recorder, setRecorder] = useState<Recorder | null>(null);
    const [pendingSentence, setPendingSentence] = useState<string>("");
    const [completedSentences, setCompletedSentences] = useState<string[]>([]);

    const { chat: bot } = useContext(ChatContext);
    const { viewer } = useContext(ViewerContext);

    const [audioContext] = useState<AudioContext>(() => new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 48000 }));
    const decoderRef = useAudioDecoder();
    const { scheduleAudioPlayback, sourceNodeRef } = useAudioPlayback(audioContext);

    const handleWebSocketMessage = async (event: MessageEvent) => {
        const arrayBuffer = await event.data.arrayBuffer();
        const view = new Uint8Array(arrayBuffer);
        const tag = view[0];
        const payload = arrayBuffer.slice(1);

        if (tag === 1) {
            const { channelData } = await decoderRef.current.decode(new Uint8Array(payload));
            if (channelData?.[0]) {
                scheduleAudioPlayback(channelData[0], viewer.model?._lipSync?.audio.currentTime, viewer);
            }
        }

        if (tag === 2) {
            const text = new TextDecoder().decode(payload);
            setPendingSentence((prev) => {
                const updated = prev + text;
                if (/[.!?]$/.test(updated)) {
                    setCompletedSentences((prev) => [...prev, updated]);
                    return "";
                }
                return updated;
            });
        }
    };

    const handleWebScoketOpen = async () => {
        console.log("WebSocket connection opened");

        const recorder = new Recorder({
            encoderPath: "https://cdn.jsdelivr.net/npm/opus-recorder@latest/dist/encoderWorker.min.js",
            streamPages: true,
            encoderApplication: 2049,
            encoderFrameSize: 80, // milliseconds, equal to 1920 samples at 24000 Hz
            encoderSampleRate: 24000,  // 24000 to match model's sample rate
            maxFramesPerPage: 1,
            numberOfChannels: 1,
        });

        recorder.ondataavailable = async (arrayBuffer: ArrayBuffer) => {
            if (socketRef.current) {
                if (socketRef.current.readyState !== WebSocket.OPEN) {
                    console.log("Socket not open, dropping audio");
                    return;
                }
                await socketRef.current.send(arrayBuffer);
            }
        };

        recorder.start().then(() => {
            console.log("Recording started");
            setRecorder(recorder);
        });

    }

    const handleWebScoketClose = async () => {
        console.log("WebSocket connection closed");

        // Stop recorder
        recorder?.stop();
        setRecorder(null);

        // Disconnect audio source
        if (sourceNodeRef.current) {
            sourceNodeRef.current.disconnect();
            sourceNodeRef.current = null;
        }

        // Close WebSocket
        if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
        }
    }

    const socketRef = useWebSocket(
        getBaseURL(),
        handleWebScoketOpen,
        handleWebSocketMessage,
        handleWebScoketClose
    );

    useEffect(() => {
        if (!pendingSentence && completedSentences.length > 0) {
            bot.bubbleMessage("assistant", completedSentences[completedSentences.length - 1]);
        }
        if (pendingSentence) {
            setAssistantText(pendingSentence);
        }
    }, [pendingSentence, completedSentences]);

    return <AudioControl recorder={recorder} />;
};
