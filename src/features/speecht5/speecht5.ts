import { WaveFile } from 'wavefile';
import { TalkStyle } from "@/features/messages/messages";
import { updateFileProgress } from "@/utils/progress";

export async function speecht5(
  message: string,
  speakerEmbeddingsUrl: string,
  style: TalkStyle,
) {
  (<any>window).chatvrm_worker_speecht5_audiocache = null;

  // initialize worker if not already initialized
  if (! window.hasOwnProperty('chatvrm_worker_speecht5')) {
    (<any>window).chatvrm_worker_speecht5 = new Worker(new URL("../../workers/speecht5.js", import.meta.url), {
      type: "module",
    });
    console.log((<any>window).chatvrm_worker_speecht5);
  
    (<any>window).chatvrm_worker_speecht5.addEventListener("message", (event: any) => {
      const message = event.data;
      console.log(message);
      switch (message.status) {
        case "ready":
          console.log("speecht5 worker ready");
          break;
        case "progress":
          updateFileProgress(message.file, message.progress);
          break;
        case "done":
          updateFileProgress(message.file, 100);
          break;
        case "complete":
          console.log("complete");
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
    while (true) {
      console.log('waiting...');

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
