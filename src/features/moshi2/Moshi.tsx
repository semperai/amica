import React, { useRef, useEffect, useState, useContext } from 'react';
import Recorder from 'opus-recorder'
import { OggOpusDecoder } from 'ogg-opus-decoder';
import { ChatContext } from '../chat/chatContext';
import { ViewerContext } from '../vrmViewer/viewerContext';
import { Role } from '../chat/messages';
import { config } from '@/utils/config';

const getBaseURL = (): URL => {
    const wsProtocol = (window.location.protocol === 'https:') ? 'wss' : 'ws';
    const url = new URL(`${wsProtocol}://${config("moshi_url")}/ws`);
    return url;
}

interface Recorder {
    start: () => Promise<void>;
    stop: () => void;
    ondataavailable: (arrayBuffer: ArrayBuffer) => void;
    setRecordingGain: (gain: number) => void;
}

interface AudioControlProps {
    recorder: Recorder | null;
    amplitude: number;
}

export function Moshi({ setAssistantText, setShownMessage }: {
    setAssistantText: (message: string) => void,
    setShownMessage: (role: Role) => void,
}) {
    // Mic Input
    const [recorder, setRecorder] = useState<Recorder | null>(null); // Opus recorder
    const [amplitude, setAmplitude] = useState<number>(0); // Amplitude, captured from PCM analyzer

    // Audio playback
    const [audioContext] = useState<AudioContext>(() => new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 48000 }));
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null); // Audio source node
    const scheduledEndTimeRef = useRef<number>(0); // Scheduled end time for audio playback
    const decoderRef = useRef<any | null>(null); // Decoder for converting opus to PCM

    // WebSocket
    const socketRef = useRef<WebSocket | null>(null); // Ongoing websocket connection

    // UI State
    const [warmupComplete, setWarmupComplete] = useState<boolean>(false);
    const [completedSentences, setCompletedSentences] = useState<string[]>([]);
    const [pendingSentence, setPendingSentence] = useState<string>('');

    const stopAllActions = () => {
        console.log('Stopping all actions...');
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
    };

    // Audio Playback: Prep decoder for converting opus to PCM for audio playback
    useEffect(() => {
        const initializeDecoder = async () => {
            const decoder = new OggOpusDecoder();
            await decoder.ready;
            decoderRef.current = decoder;
            console.log("Ogg Opus decoder initialized");
        };

        initializeDecoder();

        return () => {
            if (decoderRef.current) {
                decoderRef.current.free();
            }
        };
    }, []);

    // Mic Input: start the Opus recorder
    const startRecording = async (): Promise<void> => {
        // prompts user for permission to use microphone
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

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

        // create a MediaRecorder object for capturing PCM (calculating amplitude)
        const analyzerContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyzer = analyzerContext.createAnalyser();
        analyzer.fftSize = 256;
        const sourceNode = analyzerContext.createMediaStreamSource(stream);
        sourceNode.connect(analyzer);

        // Use a separate audio processing function instead of MediaRecorder
        const processAudio = () => {
            const dataArray = new Uint8Array(analyzer.frequencyBinCount);
            analyzer.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
            setAmplitude(average);
            requestAnimationFrame(processAudio);
        };
        processAudio();
    };

    const { chat: bot } = useContext(ChatContext);
    const { viewer } = useContext(ViewerContext);

    useEffect(() => {
        if (pendingSentence === '' && completedSentences.length > 0) {
            bot.bubbleMessage("assistant", completedSentences[completedSentences.length - 1])
        }
        
        if (pendingSentence !== '') {
        setAssistantText(pendingSentence);

        }
    }, [pendingSentence,completedSentences]);

    // Audio Playback: schedule PCM audio chunks for seamless playback
    const scheduleAudioPlayback = async (newAudioData: Float32Array): Promise<void> => {
        const sampleRate = audioContext.sampleRate;
        const numberOfChannels = 1;
        const nowTime = viewer.model?._lipSync?.audio.currentTime;

        // Create a new buffer and source node for the incoming audio data
        const newBuffer = audioContext.createBuffer(numberOfChannels, newAudioData.length, sampleRate);
        newBuffer.copyToChannel(newAudioData, 0);
        const sourceNode = viewer.model?._lipSync?.audio.createBufferSource();
        sourceNode!.buffer = newBuffer;
        sourceNode!.connect(viewer.model?._lipSync?.audio.destination!);
        sourceNode!.connect(viewer.model?._lipSync?.analyser!);


        // Schedule the new audio to play immediately after any currently playing audio
        const startTime = Math.max(scheduledEndTimeRef.current, nowTime!);
        sourceNode!.start(startTime);

        // Update the scheduled end time so we know when to schedule the next piece of audio
        scheduledEndTimeRef.current = startTime + newBuffer.duration;

        if (sourceNodeRef.current && sourceNodeRef.current.buffer) {
            const currentEndTime = scheduledEndTimeRef.current;  // Use the manual tracking of the end time
            if (currentEndTime <= nowTime!) {
                sourceNodeRef.current.disconnect();
            }
        }
        sourceNodeRef.current = sourceNode!;
    };


    // WebSocket: open websocket connection and start recording
    useEffect(() => {
        const endpoint = getBaseURL();
        console.log("Connecting to", endpoint);
        const socket = new WebSocket(endpoint);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log("WebSocket connection opened");
            startRecording();
            setWarmupComplete(true);
        };

        socket.onmessage = async (event) => {
            // data is a blob, convert to array buffer
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
    
                    // Decode the payload
                    const { channelData, samplesDecoded } = await decoderRef.current.decode(new Uint8Array(payload));
    
                    // Ensure decoded data is valid
                    if (samplesDecoded > 0 && channelData?.[0]) {
                        scheduleAudioPlayback(channelData[0]);
                    } else {
                        console.warn("Decoded audio data is invalid or empty. Skipping playback.");
                    }
                } catch (decodeError) {
                    console.error("Error during audio decoding:", decodeError);
                }
            }
            if (tag === 2) {
                // text data
                const decoder = new TextDecoder();
                const text = decoder.decode(payload);

                setPendingSentence(prevPending => {
                    const updatedPending = prevPending + text;
                    if (updatedPending.endsWith('.') || updatedPending.endsWith('!') || updatedPending.endsWith('?')) {
                        setCompletedSentences(prevCompleted => [...prevCompleted, updatedPending]);
                        return '';
                    }
                    return updatedPending;
                });
            }
        };

        socket.onclose = () => {
            console.log("WebSocket connection closed");
        };

        return () => {
            stopAllActions();
        };
    }, []);

    return (
        <AudioControl recorder={recorder} amplitude={amplitude} />
    );



}

const AudioControl: React.FC<AudioControlProps> = ({ recorder, amplitude }) => {
    const [muted, setMuted] = useState<boolean>(true);

    const toggleMute = (): void => {
        if (!recorder) {
            return;
        }
        setMuted(!muted);
        console.log("Mute")
        recorder.setRecordingGain(muted ? 1 : 0);
    };

    // unmute automatically once the recorder is ready
    useEffect(() => {
        if (recorder) {
        setMuted(false);
        recorder.setRecordingGain(1);
        console.log("Unmute")
        }
    },
    [recorder]);

    return (
        <div className="fixed bottom-5 z-20 w-full">


            <div className='flex flex-col justify-center items-center'>
                <div
                    className={`rounded-full transition-all duration-100 ease-out hover:cursor-pointer backdrop-blur-lg ${muted ? 'bg-gray-200 hover:bg-red-300' : 'bg-red-500 hover:bg-red-300'}`}
                    onClick={toggleMute}
                    style={{
                        width: `25px`,
                        height: `25px`,
                    }}
                ></div>
            </div>


        </div>
    );
};



