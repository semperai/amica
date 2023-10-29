import React, { useCallback, useEffect, useState } from "react";
import { IconButton } from "./iconButton";
import axios from "axios";
import Modal from "./modal";
import { UrlInput } from "./urlInput";
import AudioPlayer from "./audioPlayer";
import { TranscribeButton } from "./transcribeButton";
import Constants from "@/utils/constants";
import { Transcriber } from "../hooks/useTranscriber";
import Progress from "./progress";
import AudioRecorder from "./audioRecorder";

function titleCase(str: string) {
  str = str.toLowerCase();
  return (str.match(/\w+.?/g) || [])
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join("");
}

// List of supported languages:
// https://help.openai.com/en/articles/7031512-whisper-api-faq
// https://github.com/openai/whisper/blob/248b6cb124225dd263bb9bd32d060b6517e067f8/whisper/tokenizer.py#L79
const LANGUAGES = {
  en: "english",
  zh: "chinese",
  de: "german",
  es: "spanish/castilian",
  ru: "russian",
  ko: "korean",
  fr: "french",
  ja: "japanese",
  pt: "portuguese",
  tr: "turkish",
  pl: "polish",
  ca: "catalan/valencian",
  nl: "dutch/flemish",
  ar: "arabic",
  sv: "swedish",
  it: "italian",
  id: "indonesian",
  hi: "hindi",
  fi: "finnish",
  vi: "vietnamese",
  he: "hebrew",
  uk: "ukrainian",
  el: "greek",
  ms: "malay",
  cs: "czech",
  ro: "romanian/moldavian/moldovan",
  da: "danish",
  hu: "hungarian",
  ta: "tamil",
  no: "norwegian",
  th: "thai",
  ur: "urdu",
  hr: "croatian",
  bg: "bulgarian",
  lt: "lithuanian",
  la: "latin",
  mi: "maori",
  ml: "malayalam",
  cy: "welsh",
  sk: "slovak",
  te: "telugu",
  fa: "persian",
  lv: "latvian",
  bn: "bengali",
  sr: "serbian",
  az: "azerbaijani",
  sl: "slovenian",
  kn: "kannada",
  et: "estonian",
  mk: "macedonian",
  br: "breton",
  eu: "basque",
  is: "icelandic",
  hy: "armenian",
  ne: "nepali",
  mn: "mongolian",
  bs: "bosnian",
  kk: "kazakh",
  sq: "albanian",
  sw: "swahili",
  gl: "galician",
  mr: "marathi",
  pa: "punjabi/panjabi",
  si: "sinhala/sinhalese",
  km: "khmer",
  sn: "shona",
  yo: "yoruba",
  so: "somali",
  af: "afrikaans",
  oc: "occitan",
  ka: "georgian",
  be: "belarusian",
  tg: "tajik",
  sd: "sindhi",
  gu: "gujarati",
  am: "amharic",
  yi: "yiddish",
  lo: "lao",
  uz: "uzbek",
  fo: "faroese",
  ht: "haitian creole/haitian",
  ps: "pashto/pushto",
  tk: "turkmen",
  nn: "nynorsk",
  mt: "maltese",
  sa: "sanskrit",
  lb: "luxembourgish/letzeburgesch",
  my: "myanmar/burmese",
  bo: "tibetan",
  tl: "tagalog",
  mg: "malagasy",
  as: "assamese",
  tt: "tatar",
  haw: "hawaiian",
  ln: "lingala",
  ha: "hausa",
  ba: "bashkir",
  jw: "javanese",
  su: "sundanese",
};

export enum AudioSource {
  URL = "URL",
  FILE = "FILE",
  RECORDING = "RECORDING",
}

export function AudioManager(props: { transcriber: Transcriber }) {
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const [audioData, setAudioData] = useState<
    | {
        buffer: AudioBuffer;
        url: string;
        source: AudioSource;
        mimeType: string;
      }
    | undefined
  >(undefined);
  const [audioDownloadUrl, setAudioDownloadUrl] = useState<
    string | undefined
  >(undefined);

  const isAudioLoading = progress !== undefined;

  const resetAudio = () => {
    setAudioData(undefined);
    setAudioDownloadUrl(undefined);
  };

  const setAudioFromDownload = async (
    data: ArrayBuffer,
    mimeType: string,
  ) => {
    const audioCTX = new AudioContext({
      sampleRate: Constants.SAMPLING_RATE,
    });
    const blobUrl = URL.createObjectURL(
      new Blob([data], { type: "audio/*" }),
    );
    const decoded = await audioCTX.decodeAudioData(data);
    setAudioData({
      buffer: decoded,
      url: blobUrl,
      source: AudioSource.URL,
      mimeType: mimeType,
    });
  };

  const setAudioFromRecording = async (data: Blob) => {
    resetAudio();
    setProgress(0);
    const blobUrl = URL.createObjectURL(data);
    const fileReader = new FileReader();
    fileReader.onprogress = (event) => {
      setProgress(event.loaded / event.total || 0);
    };
    fileReader.onloadend = async () => {
      const audioCTX = new AudioContext({
        sampleRate: Constants.SAMPLING_RATE,
      });
      const arrayBuffer = fileReader.result as ArrayBuffer;
      const decoded = await audioCTX.decodeAudioData(arrayBuffer);
      setProgress(undefined);
      setAudioData({
        buffer: decoded,
        url: blobUrl,
        source: AudioSource.RECORDING,
        mimeType: data.type,
      });
    };
    fileReader.readAsArrayBuffer(data);
  };

  const downloadAudioFromUrl = async (
    requestAbortController: AbortController,
  ) => {
    if (audioDownloadUrl) {
      try {
        setAudioData(undefined);
        setProgress(0);
        const { data, headers } = (await axios.get(audioDownloadUrl, {
          signal: requestAbortController.signal,
          responseType: "arraybuffer",
          onDownloadProgress(progressEvent) {
            setProgress(progressEvent.progress || 0);
          },
        })) as {
          data: ArrayBuffer;
          headers: { "content-type": string };
        };

        let mimeType = headers["content-type"];
        if (!mimeType || mimeType === "audio/wave") {
          mimeType = "audio/wav";
        }
        setAudioFromDownload(data, mimeType);
      } catch (error) {
        console.log("Request failed or aborted", error);
      } finally {
        setProgress(undefined);
      }
    }
  };

  // When URL changes, download audio
  useEffect(() => {
    if (audioDownloadUrl) {
      const requestAbortController = new AbortController();
      downloadAudioFromUrl(requestAbortController);
      return () => {
        requestAbortController.abort();
      };
    }
  }, [audioDownloadUrl]);

  return (
    <>
      <div>
        <div>
          {navigator.mediaDevices && (
            <>
              <RecordTile
                setAudioData={(e) => {
                  props.transcriber.onInputChange();
                  setAudioFromRecording(e);
                }}
              />
            </>
          )}
        </div>
        {
          <AudioDataBar
            progress={isAudioLoading ? progress : +!!audioData}
          />
        }
      </div>
      {audioData && (
        <>
          <AudioPlayer
            audioUrl={audioData.url}
            mimeType={audioData.mimeType}
          />

          <div className='flex justify-center items-center'>
            <TranscribeButton
              onClick={() => {
                props.transcriber.start(audioData.buffer);
              }}
              isModelLoading={props.transcriber.isModelLoading}
              // isAudioLoading ||
              isTranscribing={props.transcriber.isBusy}
            />

          </div>
          {props.transcriber.progressItems.length > 0 && (
            <div className='absolute z-10 top-0 right-0 p-4 w-full'>
              <label>
                Loading model files... (only run once)
              </label>
              {props.transcriber.progressItems.map((data) => (
                <div key={data.file}>
                  <Progress
                    text={data.file}
                    percentage={data.progress}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}

function AudioDataBar(props: { progress: number }) {
  return <ProgressBar progress={`${Math.round(props.progress * 100)}%`} />;
}

function ProgressBar(props: { progress: string }) {
  return (
    <div className='w-full bg-gray-200 rounded-full h-1 dark:bg-gray-700'>
      <div
        className='bg-blue-600 h-1 rounded-full transition-all duration-100'
        style={{ width: props.progress }}
      ></div>
    </div>
  );
}

function RecordTile(props: {
  setAudioData: (data: Blob) => void;
}) {
  const [showModal, setShowModal] = useState(false);

  const onClick = () => {
    setShowModal(true);
  };

  const onClose = () => {
    setShowModal(false);
  };

  const onSubmit = (data: Blob | undefined) => {
    if (data) {
      props.setAudioData(data);
      onClose();
    }
  };

  return (
    <>
      <IconButton
        iconName="24/Microphone"
        className="bg-secondary hover:bg-secondary-hover active:bg-secondary-press disabled:bg-secondary-disabled"
        isProcessing={false/*isMicRecording*/}
        disabled={false/*isChatProcessing*/}
        onClick={onClick}
      />
      <RecordModal
        show={showModal}
        onSubmit={onSubmit}
        onClose={onClose}
      />
    </>
  );
}

function RecordModal(props: {
  show: boolean;
  onSubmit: (data: Blob | undefined) => void;
  onClose: () => void;
}) {
  const [audioBlob, setAudioBlob] = useState<Blob>();

  const onRecordingComplete = (blob: Blob) => {
    setAudioBlob(blob);
  };

  const onSubmit = () => {
    props.onSubmit(audioBlob);
    setAudioBlob(undefined);
  };

  const onClose = () => {
    props.onClose();
    setAudioBlob(undefined);
  };

  return (
    <Modal
      show={props.show}
      title={"From Recording"}
      content={
        <>
          {"Record audio using your microphone"}
          <AudioRecorder onRecordingComplete={onRecordingComplete} />
        </>
      }
      onClose={onClose}
      submitText={"Load"}
      submitEnabled={audioBlob !== undefined}
      onSubmit={onSubmit}
    />
  );
}
