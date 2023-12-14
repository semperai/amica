import * as ort from "onnxruntime-web"
ort.env.wasm.wasmPaths = '/_next/static/chunks/'

import { useContext, useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { useMicVAD } from "@ricky0123/vad-react"
import { IconButton } from "./iconButton";
import { useTranscriber } from "@/hooks/useTranscriber";
import { cleanTranscript } from "@/utils/stringProcessing";
import { AlertContext } from "@/features/alert/alertContext";
import { ChatContext } from "@/features/chat/chatContext";
import { openaiWhisper  } from "@/features/openaiWhisper/openaiWhisper";
import { whispercpp  } from "@/features/whispercpp/whispercpp";
import { config, updateConfig } from "@/utils/config";
import wavefile, { WaveFile } from "wavefile";

export default function MessageInput({
  userMessage,
  setUserMessage,
  isChatProcessing,
  onChangeUserMessage,
}: {
  userMessage: string;
  setUserMessage: (message: string) => void;
  isChatProcessing: boolean;
  onChangeUserMessage: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
}) {
  const transcriber = useTranscriber();
  const inputRef = useRef<HTMLInputElement>(null);
  const [whisperOpenAIOutput, setWhisperOpenAIOutput] = useState<any | null>(null);
  const [whisperCppOutput, setWhisperCppOutput] = useState<any | null>(null);
  const { chat: bot } = useContext(ChatContext);
  const { alert } = useContext(AlertContext);

  const vad = useMicVAD({
    startOnLoad: false,
    onSpeechStart: () => {
      console.debug('vad', 'on_speech_start');
      console.time('performance_speech');
    },
    onSpeechEnd: (audio: Float32Array) => {
      console.debug('vad', 'on_speech_end');
      console.timeEnd('performance_speech');
      console.time('performance_transcribe');
      (window as any).chatvrm_latency_tracker = {
        start: +Date.now(),
        active: true,
      };

      try {
        switch (config("stt_backend")) {
          case 'whisper_browser': {
            console.debug('whisper_browser attempt');
            // since VAD sample rate is same as whisper we do nothing here
            // both are 16000
            const audioCtx = new AudioContext();
            const buffer = audioCtx.createBuffer(1, audio.length, 16000);
            buffer.copyToChannel(audio, 0, 0);
            transcriber.start(buffer);
            break;
          }
          case 'whisper_openai': {
            console.debug('whisper_openai attempt');
            const wav = new WaveFile();
            wav.fromScratch(1, 16000, '32f', audio);
            const file = new File([wav.toBuffer()], "input.wav", { type: "audio/wav" });

            let prompt;
            // TODO load prompt if it exists

            (async () => {
              try {
                const transcript = await openaiWhisper(file, prompt);
                setWhisperOpenAIOutput(transcript);
              } catch (e: any) {
                console.error('whisper_openai error', e);
                alert.error('whisper_openai error', e.toString());
              }
            })();
            break;
          }
          case 'whispercpp': {
            console.debug('whispercpp attempt');
            const wav = new WaveFile();
            wav.fromScratch(1, 16000, '32f', audio);
            wav.toBitDepth('16');
            const file = new File([wav.toBuffer()], "input.wav", { type: "audio/wav" });

            let prompt;
            // TODO load prompt if it exists

            (async () => {
              try {
                const transcript = await whispercpp(file, prompt);
                setWhisperCppOutput(transcript);
              } catch (e: any) {
                console.error('whispercpp error', e);
                alert.error('whispercpp error', e.toString());
              }
            })();
            break;
          }
        }
      } catch (e: any) {
        console.error('stt_backend error', e);
        alert.error('STT backend error', e.toString());
      }
    },
  });

  if (vad.errored) {
    console.error('vad error', vad.errored);
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
    console.timeEnd('performance_transcribe');
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

  // for whispercpp
  useEffect(() => {
    if (whisperCppOutput) {
      const output = whisperCppOutput?.text;
      handleTranscriptionResult(output);
    }
  }, [whisperCppOutput]);

  function clickedSendButton() {
    bot.receiveMessageFromUser(userMessage);
    // only if we are using non-VAD mode should we focus on the input
    if (! vad.listening) {
      inputRef.current?.focus();
    }
    setUserMessage("");
  }

  return (
    <div className="fixed bottom-2 z-20 w-full">
      <div className="mx-auto max-w-4xl p-2 backdrop-blur-lg border-0 rounded-lg">
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
  );
}
