import { useCallback, useMemo, useState } from "react";
import { useWorker } from "./useWorker";
import { updateFileProgress } from "@/utils/progress";

interface ProgressItem {
  file: string;
  loaded: number;
  progress: number;
  total: number;
  name: string;
  status: string;
}

interface TranscriberUpdateData {
  data: [
    string,
    { chunks: { text: string; timestamp: [number, number | null] }[] },
  ];
  text: string;
}

interface TranscriberCompleteData {
  data: {
    text: string;
    chunks: { text: string; timestamp: [number, number | null] }[];
  };
}

export interface TranscriberData {
  isBusy: boolean;
  text: string;
  chunks: { text: string; timestamp: [number, number | null] }[];
}

export interface Transcriber {
  onInputChange: () => void;
  isBusy: boolean;
  isModelLoading: boolean;
  start: (audioData: AudioBuffer | undefined) => void;
  output?: TranscriberData;
}

export function useTranscriber(): Transcriber {
  const [transcript, setTranscript] = useState<TranscriberData | undefined>(
    undefined,
  );
  const [isBusy, setIsBusy] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);

  const webWorker = useWorker("whisper", (event) => {
    const message = event.data;
    // Update the state with the result
    switch (message.status) {
      case "progress":
        // Model file progress: update one of the progress items.
        updateFileProgress(message.file, message.progress);
        break;
      case "update":
        // Received partial update
        // console.log("update", message);
        // eslint-disable-next-line no-case-declarations
        const updateMessage = message as TranscriberUpdateData;
        setTranscript({
          isBusy: true,
          text: updateMessage.data[0],
          chunks: updateMessage.data[1].chunks,
        });
        break;
      case "complete":
        // Received complete transcript
        console.log("useTranscriber complete", message);
        // eslint-disable-next-line no-case-declarations
        const completeMessage = message as TranscriberCompleteData;
        setTranscript({
          isBusy: false,
          text: completeMessage.data.text,
          chunks: completeMessage.data.chunks,
        });
        setIsBusy(false);
        break;

      case "initiate":
        // Model file start load: add a new progress item to the list.
        setIsModelLoading(true);
        break;
      case "ready":
        setIsModelLoading(false);
        break;
      case "error":
        setIsBusy(false);
        alert(
          `${message.data.message} This is most likely because you are using Safari on an M1/M2 Mac. Please try again from Chrome, Firefox, or Edge.\n\nIf this is not the case, please file a bug report.`,
        );
        break;
      case "done":
        // Model file loaded: remove the progress item from the list.
        updateFileProgress(message.file, 100);
        break;

      default:
        // initiate/download/done
        break;
    }
  });

  const onInputChange = useCallback(() => {
    setTranscript(undefined);
  }, []);

  const postRequest = useCallback(
    async (audioData: AudioBuffer | undefined) => {
      if (audioData) {
        setTranscript(undefined);
        setIsBusy(true);

        let audio;
        if (audioData.numberOfChannels === 2) {
          const SCALING_FACTOR = Math.sqrt(2);

          let left = audioData.getChannelData(0);
          let right = audioData.getChannelData(1);

          audio = new Float32Array(left.length);
          for (let i = 0; i < audioData.length; ++i) {
              audio[i] = SCALING_FACTOR * (left[i] + right[i]) / 2;
          }
        } else {
          // If the audio is not stereo, we can just use the first channel:
          audio = audioData.getChannelData(0);
        }

        webWorker.postMessage({
          audio,
        });
      }
    },
    [webWorker],
  );

  const transcriber = useMemo(() => {
    return {
      onInputChange,
      isBusy,
      isModelLoading,
      start: postRequest,
      output: transcript,
    };
  }, [
    isBusy,
    isModelLoading,
    postRequest,
    transcript,
  ]);

  return transcriber;
}
