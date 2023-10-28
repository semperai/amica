import { MessageInput } from "@/components/messageInput";
import { useCallback, useEffect, useState, useRef } from "react";
import { WaveFile } from 'wavefile';

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
    useState<SpeechRecognition>();
  const [isMicRecording, setIsMicRecording] = useState(false);

  const worker = useRef<Worker>(null);
  const [transcriptionResult, setTranscriptionResult] = useState("");
  const [transcriptionReady, setTranscriptionReady] = useState(false);


  useEffect(() => {
    if (!worker.current) {
      // Create the worker if it does not yet exist.
      // @ts-ignore current is mutable
      worker.current = new Worker(new URL('./../features/transformers/worker.ts', import.meta.url), {
        type: 'module'
      });
    }
    // Create a callback function for messages from the worker thread.
      const onMessageReceived = (e: MessageEvent) => {
        switch (e.data.status) {
          case 'initiate':
            setTranscriptionReady(false);
            break;
          case 'ready':
            setTranscriptionReady(true);
            break;
          case 'complete':
            setTranscriptionResult(e.data.output[0])
            break;
        }
      };

    // Attach the callback function as an event listener.
    worker.current.addEventListener('message', onMessageReceived);

    // Define a cleanup function for when the component is unmounted.
    return () => {
      if (worker.current !== null) {
        worker.current.removeEventListener('message', onMessageReceived);
      }
    };
  });

  const transcribe = useCallback((audioData: Float64Array) => {
    console.log('transcribe', worker.current);
    if (worker.current) {
      console.log('current');
      worker.current.postMessage({ audioData });
    }
  }, []);


  // Process speech recognition results
  const handleRecognitionResult = useCallback(
    (event: SpeechRecognitionEvent) => {
      const text = event.results[0][0].transcript;
      setUserMessage(text);

      // At the end of the speech
      if (event.results[0].isFinal) {
        setUserMessage(text);
        // Start generating response text
        onChatProcessStart(text);
      }
    },
    [onChatProcessStart]
  );

  const handleClickMicButton = useCallback(() => {
    if (isMicRecording) {
      (async () => {
        const url = '/jfk.wav';
        const buf = Buffer.from(await fetch(url).then(x => x.arrayBuffer()))

        // Read .wav file and convert it to required format
        let wav = new WaveFile(buf);
        wav.toBitDepth('32f'); // Pipeline expects input as a Float32Array
        wav.toSampleRate(16000); // Whisper expects audio with a sampling rate of 16000
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

        console.log('typeof', typeof(audioData));

        await transcribe(audioData);
        setIsMicRecording(false);
      })();

      return;
    }

    setIsMicRecording(true);
  }, [isMicRecording]);

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
      isMicRecording={isMicRecording}
      onChangeUserMessage={(e) => setUserMessage(e.target.value)}
      onClickMicButton={handleClickMicButton}
      onClickSendButton={handleClickSendButton}
    />
  );
};
