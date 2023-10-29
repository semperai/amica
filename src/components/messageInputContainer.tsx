import { MessageInput } from "@/components/messageInput";
import { useCallback, useEffect, useState, useRef } from "react";
import { WaveFile } from 'wavefile';
import { useAudioRecorder } from 'react-audio-voice-recorder';
import { FFmpeg } from '@ffmpeg/ffmpeg';

type Props = {
  isChatProcessing: boolean;
  onChatProcessStart: (text: string) => void;
};

/**
 * Provides text input and voice input
 *
 * Automatically send when speech recognition is completed,
 * and disable input while generating response text
 */
export const MessageInputContainer = ({
  isChatProcessing,
  onChatProcessStart,
}: Props) => {
  const [userMessage, setUserMessage] = useState("");

  // const ffmpeg = useRef(new FFmpeg());
  const transcriptionWorker = useRef<Worker>(null);
  const [transcriptionResult, setTranscriptionResult] = useState("");
  // this is used to ensure that useEffect below is triggered
  // in case transcriptionResult is the same as the previous one
  const [transcriptionIndex, setTranscriptionIndex] = useState(0);
  const [transcriptionReady, setTranscriptionReady] = useState(false);

  const [downloadProgress, setDownloadProgress] = useState<Map<string, number>>(new Map());
  const [downloadProgressChildren, setDownloadProgressChildren] = useState<React.ReactElement>(<>hello</>);


  const {
    startRecording,
    stopRecording,
    recordingBlob,
    isRecording,
  } = useAudioRecorder(
    {
      noiseSuppression: true,
      echoCancellation: true,
    },
    // onNotAllowedOrFound
    (e: DOMException) => {
      console.error(e);
    },
    {
      // mimeType: 'audio/wav',
    }
  );


  useEffect(() => {
    console.log('downloadProgress', downloadProgress);
    if (downloadProgress.size === 0) {
      setDownloadProgressChildren(<></>);
      return;
    }

    const children = [];
    for (const [key, value] of downloadProgress.entries()) {
      children.push(<div key={key}>{key}: {value}</div>);
    }
    setDownloadProgressChildren(<div>{children}</div>);
  }, [downloadProgress]);

  useEffect(() => {
    setUserMessage(transcriptionResult);
  }, [transcriptionResult, transcriptionIndex]);

  useEffect(() => {
    if (!transcriptionWorker.current) {
      // Create the worker if it does not yet exist.
      // @ts-ignore current is mutable
      transcriptionWorker.current = new Worker(new URL('./../features/transformers/transcriptionWorker.ts', import.meta.url), {
        type: 'module'
      });
    }

    // Create a callback function for messages from the worker thread.
    const onMessageReceived = (e: MessageEvent) => {
      // console.log('messageReceived', e);
      switch (e.data.status) {
        // TODO show download, progress, done in a panel on screen
        // add new rows when download is seen, remove them when done is seen
        case 'download':
          // name, file
          downloadProgress.set(e.data.file, 0);
          setDownloadProgress(downloadProgress);
          break;
        case 'progress':
          // file, progress, loaded, total, name
          downloadProgress.set(e.data.file, e.data.progress);
          setDownloadProgress(downloadProgress);
          break;
        case 'done':
          // file, name
          downloadProgress.delete(e.data.file);
          setDownloadProgress(downloadProgress);
          break;

        case 'initiate':
          // file, name
          setTranscriptionReady(false);
          break;
        case 'ready':
          // model, task
          setTranscriptionReady(true);
          break;
        case 'complete':
          // output.chunks[].{text, timestamp[2]}
          // output.text
          setTranscriptionResult(e.data.output.text);
          setTranscriptionIndex(transcriptionIndex + 1);
          break;
      }
    };

    // Attach the callback function as an event listener.
    transcriptionWorker.current.addEventListener('message', onMessageReceived);

    // Define a cleanup function for when the component is unmounted.
    return () => {
      if (transcriptionWorker.current !== null) {
        transcriptionWorker.current.removeEventListener('message', onMessageReceived);
      }
    };
  });

  const transcribe = useCallback((audioData: Float64Array) => {
    console.log('transcribe', transcriptionWorker.current);
    if (transcriptionWorker.current) {
      console.log('current');
      transcriptionWorker.current.postMessage({ audioData });
    }
  }, []);


  const handleClickMicButton = useCallback(() => {
    if (isRecording) {
      (async () => {
        const s = stopRecording();
        console.log(s);
        console.log(recordingBlob);

          /*
        let wav = new WaveFile(await recordingBlob.arrayBuffer());
        wav.toBitDepth('32f'); // Pipeline expects input as a Float32Array
        wav.toSampleRate(16000); // Whisper expects audio with a sampling rate of
6000
        let audioData = wav.getSamples();
        if (Array.isArray(audioData)) {
          if (audioData.length > 1) {
            const SCALING_FACTOR = Math.sqrt(2);

            // Merge channels (into first channel to save memory)
            for (let i = 0; i < audioData[0].length; ++i) {
              audioData[0][i] = SCALING_FACTOR * (audioData[0][i] + audioData[1][i]) / 2;
            }
          }

          // Select first channel
          audioData = audioData[0];
        }
        */


        const audioData = new Float64Array(176000);
        transcribe(audioData);
      })();

      return;
    }

    startRecording();
  }, [isRecording]);

  const handleClickSendButton = useCallback(() => {
    onChatProcessStart(userMessage);
  }, [onChatProcessStart, userMessage]);

  useEffect(() => {
    if (!isChatProcessing) {
      setUserMessage("");
    }
  }, [isChatProcessing]);

  return (
    <MessageInput
      userMessage={userMessage}
      isChatProcessing={isChatProcessing}
      isMicRecording={isRecording}
      onChangeUserMessage={(e) => setUserMessage(e.target.value)}
      onClickMicButton={handleClickMicButton}
      onClickSendButton={handleClickSendButton}
      downloadProgressChildren={downloadProgressChildren}
    />
  );
};
