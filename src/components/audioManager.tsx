import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { UrlInput } from "./urlInput";
import AudioPlayer from "./audioPlayer";
import { Transcriber } from "../hooks/useTranscriber";
import AudioRecorder from "./audioRecorder";

export enum AudioSource {
  URL = "URL",
  FILE = "FILE",
  RECORDING = "RECORDING",
}

const SAMPLING_RATE = 16000;

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
  const [audioBlob, setAudioBlob] = useState<Blob>();

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
      sampleRate: SAMPLING_RATE,
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
        sampleRate: SAMPLING_RATE,
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
              <AudioRecorder
                isProcessing={props.transcriber.isModelLoading || props.transcriber.isBusy}
                onRecordingComplete={(blob: Blob) => {
                  const setAudioData = async (blob: Blob) => {
                    props.transcriber.onInputChange();
                    await setAudioFromRecording(blob);
                  }

                  setAudioBlob(blob);
                  setAudioData(blob);
                }}
              />
            </>
          )}
        </div>
      </div>
      {audioData && (
        <AudioPlayer
          audioUrl={audioData.url}
          mimeType={audioData.mimeType}
        />
      )}
    </>
  );
}
