import { useState } from "react"
import { useMicVAD, utils } from "@ricky0123/vad-react"
import { Transcriber } from "@/hooks/useTranscriber";
import { IconButton } from "./iconButton";

export const VAD = ({
  transcriber,
}: {
  transcriber: Transcriber;
}) => {
  const vad = useMicVAD({
    startOnLoad: false,
    onSpeechStart: () => {
      console.log('hello');
    },
    onSpeechEnd: (audio: Float32Array) => {
      // since VAD sample rate is same as whisper we do nothing here
      // both are 16000
      const audioCtx = new AudioContext();
      const buffer = audioCtx.createBuffer(1, audio.length, 16000);
      buffer.copyToChannel(audio, 0, 0);
      transcriber.start(buffer);
    },
  });

  return (
    <div className='flex flex-col justify-center items-center'>
      <IconButton
        iconName={vad.listening ? "24/PauseAlt" : "24/Microphone"}
        className="bg-secondary hover:bg-secondary-hover active:bg-secondary-press disabled:bg-secondary-disabled"
        isProcessing={vad.userSpeaking}
        disabled={vad.loading || Boolean(vad.errored)}
        onClick={vad.toggle}
      />
    </div>
  );
}

export default VAD;
