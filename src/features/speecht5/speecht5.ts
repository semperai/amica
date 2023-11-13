import { WaveFile } from 'wavefile';
import { updateFileProgress } from "@/utils/progress";
import { convertNumberToWordsEN } from "@/utils/numberSpelling";

export async function speecht5(
  message: string,
  speakerEmbeddingsUrl: string,
) {
  // empty cache
  (<any>window).chatvrm_worker_speecht5_audiocache = null;

  message = message.trim().split(/(-?\d+)/).map((s) => {
    if (s.match(/^-?\d+$/)) {
      return convertNumberToWordsEN(parseInt(s));
    } else {
      return s;
    }
  }).join("");

  // initialize worker if not already initialized
  if (! window.hasOwnProperty('chatvrm_worker_speecht5')) {
    (<any>window).chatvrm_worker_speecht5 = new Worker(new URL("../../workers/speecht5.js", import.meta.url), {
      type: "module",
    });

    (<any>window).chatvrm_worker_speecht5.addEventListener("message", (event: any) => {
      const message = event.data;
      // console.log(message);
      switch (message.status) {
        case "ready":
          console.log("speecht5 worker ready");
          break;
        case "progress":
          updateFileProgress(message.file, message.progress);
          break;
        case "done":
          console.log("speecht5 done: ", message.file);
          updateFileProgress(message.file, 100);
          break;
        case "complete":
          console.log("speecht5 complete");
          (<any>window).chatvrm_worker_speecht5_audiocache = message.data.audio;
          break;
      }
    });
  }

  // clear cache
  (<any>window).chatvrm_worker_speecht5_audiocache = null;

  // start job
  (<any>window).chatvrm_worker_speecht5.postMessage({
    text: message,
    speaker_embeddings: speakerEmbeddingsUrl,
  });

  // wait for job to complete
  await new Promise(async (resolve) => {
    console.log("speecht5 waiting for job to complete");
    while (true) {
      if((<any>window).chatvrm_worker_speecht5_audiocache !== null) {
        resolve(null);
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  });


  let wav = new WaveFile();
  wav.fromScratch(1, 16000, '32f', (<any>window).chatvrm_worker_speecht5_audiocache);
  const wavBuffer = wav.toBuffer();
  const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
  const arrayBuffer = await wavBlob.arrayBuffer();

  return { audio: arrayBuffer };
}
