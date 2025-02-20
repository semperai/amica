import React, { useState, useEffect, useRef, useContext } from "react";
import { ChatContext } from "@/features/chat/chatContext";
import { ViewerContext } from "@/features/vrmViewer/viewerContext";
import { useWebSocket } from "@/features/moshi/hooks/useWebsocket";
import { useAudioDecoder } from "@/features/moshi/hooks/useAudioDecoder";
import { useAudioPlayback } from "@/features/moshi/hooks/useAudioPlayback";
import { getBaseURL } from "@/features/moshi/utils/socketUtils";
import { AudioControlsContext } from "./audioControlsContext";
import Recorder from 'opus-recorder'

export function Moshi({ setAssistantText }: {setAssistantText: (message: string) => void }) {
    const [pendingSentence, setPendingSentence] = useState<string>("");
    const [completedSentences, setCompletedSentences] = useState<string[]>([]);

    const { chat: bot } = useContext(ChatContext);
    const { viewer } = useContext(ViewerContext);
    const { audioControls } = useContext(AudioControlsContext);

    const [audioContext] = useState<AudioContext>(() => new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 48000 }));
    const decoderRef = useAudioDecoder();
    const { scheduleAudioPlayback, sourceNodeRef } = useAudioPlayback(audioContext);

    const handleWebSocketMessage = async (event: MessageEvent) => {
        const arrayBuffer = await event.data.arrayBuffer();
        const view = new Uint8Array(arrayBuffer);
        const tag = view[0];
        const payload = arrayBuffer.slice(1);

        if (tag === 1) {
            if (!decoderRef.current) {
                console.error("Decoder reference is null or undefined. Skipping audio decoding."); 
                return;
            }

            try {
                // Validate that payload exists and is not empty
                if (!payload || payload.byteLength === 0) {
                    console.warn("Empty or invalid payload received. Skipping.");
                    return;
                }
                const { channelData, samplesDecoded } = await decoderRef.current.decode(new Uint8Array(payload));
                if (samplesDecoded > 0 && channelData?.[0]) {
                    scheduleAudioPlayback(channelData[0], viewer.model?._lipSync?.audio.currentTime, viewer);
                } else {
                    console.warn("Decoded audio data is invalid or empty. Skipping playback.");
                }
            } catch (decodeError) {
                console.error("Error during audio decoding:", decodeError);
            }
        }
        
        if (tag === 2) {
            const text = new TextDecoder().decode(payload);
            setPendingSentence((prev) => {
                const updated = prev + text;
                if (/[.!?]$/.test(updated)) {
                    setCompletedSentences((prev) => [...prev, updated]);
                    bot.bubbleMessage("assistant", updated);
                    return "";
                }
                return updated;
            });
        }
    };

    const handleWebSocketOpen = async () => {
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
            audioControls.setRecorder(recorder);
        });

    }

    const stopAllAction = async () => {
        // Stop recorder
        audioControls.getRecorder()?.stop();
        audioControls.setRecorder(null);

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
        handleWebSocketOpen,
        handleWebSocketMessage,
        () => console.log("WebSocket connection closed"),
        stopAllAction,
       
    );

    useEffect(() => {
        if (pendingSentence) {
            setAssistantText(pendingSentence);
        }
    }, [pendingSentence]);

    return <></>;
};
