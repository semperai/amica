import { pipeline, env, Pipeline } from '@xenova/transformers';

// Skip local model check
// @ts-ignore read only
env.allowLocalModels = false;

class PipelineSingleton {
  static task = "automatic-speech-recognition";
  static model = "Xenova/whisper-tiny.en";
  static revision = "output_attentions";
  static instance: Pipeline|null = null;

  static async getInstance(progress_callback?: Function) {
    if (this.instance === null) {
      this.instance = await pipeline(this.task, this.model, {
        progress_callback,
        revision: this.revision,
      });
    }

    return this.instance;
  }
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
  // this will load the pipeline and save it for future use.
  const transcriber = await PipelineSingleton.getInstance((x: any) => {
    // progress callback to track model loading.
    self.postMessage(x);
  });

  if (transcriber !== null) {
    console.time('transcribe');
    const output = await transcriber(event.data.audioData, {
      return_timestamps: 'word',
    });
    console.timeEnd('transcribe');

    // Send the output back to the main thread
    self.postMessage({
      status: 'complete',
      output: output,
    });
  }
});
