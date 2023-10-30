import React, { useCallback, useEffect, useState } from "react";
import { IconButton } from "./iconButton";
import axios from "axios";
import { UrlInput } from "./urlInput";
import AudioPlayer from "./audioPlayer";
import Constants from "@/utils/constants";
import { Transcriber } from "../hooks/useTranscriber";
import Progress from "./progress";
import AudioRecorder from "./audioRecorder";

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


  useEffect(() => {
    if (audioData) {
      props.transcriber.start(audioData.buffer);
    }
  }, [audioData]);

  return (
    <>
      <div>
        <div>
          {navigator.mediaDevices && (
            <>
              <RecordTile
                setAudioData={async (e) => {
                  console.log('set audio data', audioData);
                  props.transcriber.onInputChange();
                  await setAudioFromRecording(e);
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
  const [audioBlob, setAudioBlob] = useState<Blob>();

  const onRecordingComplete = (blob: Blob) => {
    setAudioBlob(blob);
    props.setAudioData(blob);
  };

  return (
    <AudioRecorder
      isProcessing={false}
      onRecordingComplete={onRecordingComplete}
      />
  );
}
