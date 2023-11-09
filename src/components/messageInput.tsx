import { useContext, useEffect, useRef, useState } from "react";
import { useMicVAD } from "@ricky0123/vad-react"
import { IconButton } from "./iconButton";
import { useTranscriber } from "@/hooks/useTranscriber";
import { cleanTranscript } from "@/utils/stringProcessing";
import { ChatContext } from "@/features/chat/chatContext";
import { openaiWhisper  } from "@/features/openaiWhisper/openaiWhisper";
import { config } from "@/utils/config";
import wavefile, { WaveFile } from "wavefile";

type Props = {
  userMessage: string;
  setUserMessage: (message: string) => void;
  isChatProcessing: boolean;
  onChangeUserMessage: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
};

const MessageInput = ({
  userMessage,
  setUserMessage,
  isChatProcessing,
  onChangeUserMessage,
}: Props) => {
  const transcriber = useTranscriber();
  const inputRef = useRef<HTMLInputElement>(null);
  const [whisperOpenAIOutput, setWhisperOpenAIOutput] = useState<any | null>(null);
  const { chat: bot } = useContext(ChatContext);

  const vad = useMicVAD({
    startOnLoad: false,
    onSpeechStart: () => {
      console.log('vad', 'on_speech_start');
      console.time('speech');
    },
    onSpeechEnd: (audio: Float32Array) => {
      console.timeEnd('speech');
      console.time('transcribe');

      switch (config("stt_backend")) {
        case 'whisper_browser':
          console.log('whisper_browser attempt');
          // since VAD sample rate is same as whisper we do nothing here
          // both are 16000
          const audioCtx = new AudioContext();
          const buffer = audioCtx.createBuffer(1, audio.length, 16000);
          buffer.copyToChannel(audio, 0, 0);
          transcriber.start(buffer);
          break;
        case 'whisper_openai':
          console.log('whisper_openai attempt');
          const wav = new WaveFile();
          wav.fromScratch(1, 16000, '32f', audio);
          const file = new File([wav.toBuffer()], "input.wav", { type: "audio/wav" });

          let prompt;
          // TODO load prompt if it exists

          (async () => {
            const transcript = await openaiWhisper(file, prompt);
            console.log('openai recv', transcript);
            setWhisperOpenAIOutput(transcript);
          })();
          break;
      }
    },
  });

  if (vad.errored) {
    console.log('vad error', vad.errored);
  }

  function handleTranscriptionResult(preprocessed: string) {
    const text = cleanTranscript(preprocessed);

    if (text === "") {
      return;
    }

    if (config("autosend_from_mic") === 'true') {
      bot.receiveMessageFromUser(text);
    } else {
      setUserMessage(text);
    }
    console.timeEnd('transcribe');
  }

  // for whisper_browser
  useEffect(() => {
    if (transcriber.output && ! transcriber.isBusy) {
      const output = transcriber.output?.text;
      handleTranscriptionResult(output);
    }
  }, [transcriber]);

  // for whisper_openai
  useEffect(() => {
    if (whisperOpenAIOutput) {
      const output = whisperOpenAIOutput?.text;
      handleTranscriptionResult(output);
    }
  }, [whisperOpenAIOutput]);

  function clickedSendButton() {
    bot.receiveMessageFromUser(userMessage);
    // only if we are using non-VAD mode should we focus on the input
    if (! vad.listening) {
      inputRef.current?.focus();
    }
    setUserMessage("");
  }

  return (
    <div className="absolute bottom-0 z-20 w-screen">
      <div className="bg-base text-black">
        <div className="mx-auto max-w-4xl p-2">
          <div className="grid grid-flow-col grid-cols-[min-content_1fr_min-content] gap-[8px]">
            <div className='flex flex-col justify-center items-center'>
              <IconButton
                iconName={vad.listening ? "24/PauseAlt" : "24/Microphone"}
                className="bg-secondary hover:bg-secondary-hover active:bg-secondary-press disabled:bg-secondary-disabled"
                isProcessing={vad.userSpeaking}
                disabled={config('stt_backend') === 'none' || vad.loading || Boolean(vad.errored)}
                onClick={vad.toggle}
              />
            </div>

            <input
              type="text"
              ref={inputRef}
              placeholder="Write message here..."
              onChange={onChangeUserMessage}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (userMessage === "") {
                    return false;
                  }

                  clickedSendButton();
                }
              }}
              disabled={false}

              className="disabled block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-gray-400 sm:text-sm sm:leading-6"
              value={userMessage}></input>
  
            <div className='flex flex-col justify-center items-center'>
              <IconButton
                iconName="24/Send"
                className="ml-2 bg-secondary hover:bg-secondary-hover active:bg-secondary-press disabled:bg-secondary-disabled"
                isProcessing={isChatProcessing || transcriber.isBusy}
                disabled={isChatProcessing || !userMessage || transcriber.isModelLoading}
                onClick={clickedSendButton}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
