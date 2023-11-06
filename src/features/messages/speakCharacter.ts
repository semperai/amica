import { wait } from "@/utils/wait";
import { Viewer } from "@/features/vrmViewer/viewer";
import { Screenplay, Talk, TalkStyle } from "./messages";
import { elevenlabs } from "@/features/elevenlabs/elevenlabs";
import { coqui } from "@/features/coqui/coqui";
import { speecht5 } from "@/features/speecht5/speecht5";
import { config } from "@/utils/config";

const createSpeakCharacter = () => {
  let lastTime = 0;
  let prevFetchPromise: Promise<unknown> = Promise.resolve();
  let prevSpeakPromise: Promise<unknown> = Promise.resolve();

  return (
    screenplay: Screenplay,
    viewer: Viewer,
    onStart?: () => void,
    onComplete?: () => void
  ) => {
    const fetchPromise = prevFetchPromise.then(async () => {
      const now = Date.now();
      if (now - lastTime < 1000) {
        await wait(1000 - (now - lastTime));
      }

      const buffer = await fetchAudio(screenplay.talk).catch(
        () => null
      );
      lastTime = Date.now();
      return buffer;
    });

    prevFetchPromise = fetchPromise;
    prevSpeakPromise = Promise.all([fetchPromise, prevSpeakPromise]).then(
      ([audioBuffer]) => {
        onStart?.();
        if (!audioBuffer) {
          return;
        }
        return viewer.model?.speak(audioBuffer, screenplay);
      }
    );
    prevSpeakPromise.then(() => {
      onComplete?.();
    });
  };
};

export const speakCharacter = createSpeakCharacter();

const fetchAudio = async (
  talk: Talk,
): Promise<ArrayBuffer> => {
  const ttsBackend = config("tts_backend");

  switch (ttsBackend) {
    case 'elevenlabs': {
      const voiceId = config("elevenlabs_voiceid");
      const voice = await elevenlabs(talk.message, voiceId, talk.style);
      return voice.audio;
    }
    case 'speecht5': {
      const speakerEmbeddingUrl = config('speecht5_speaker_embedding_url');
      const voice = await speecht5(talk.message, speakerEmbeddingUrl);
      return voice.audio;
    }
    case 'coqui': {
      const speakerId = config('coqui_speaker_id');
      const styleUrl = config('coqui_style_url');
      const voice = await coqui(talk.message, speakerId, styleUrl);
      return voice.audio;
    }
  }

  // ttsBackend === 'none'
  return new ArrayBuffer(0);
}
