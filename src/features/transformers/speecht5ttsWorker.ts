import { pipeline, env, Pipeline } from '@xenova/transformers';

// Skip local model check
// @ts-ignore read only
env.allowLocalModels = false;

class PipelineSingleton {
  static task = "text-to-soeech";
  static model = "Xenova/speecht5_tts";
  static instance: Pipeline|null = null;
  static quantized = false;

  static async getInstance(progress_callback?: Function) {
    if (this.instance === null) {
      this.instance = await pipeline(this.task, this.model, {
        progress_callback,
        quantized: this.quantized,
      });
    }

    return this.instance;
  }
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
  // this will load the pipeline and save it for future use.
  const synthesizer = await PipelineSingleton.getInstance((x: any) => {
    // progress callback to track model loading.
    self.postMessage(x);
  });

  if (synthesizer !== null) {
    console.time('synthesize');
    const output = await synthesizer(event.data.text, {
      // speaker_embeddings,
    });
    console.timeEnd('synthesize');

    // Send the output back to the main thread
    self.postMessage({
      status: 'complete',
      output: output,
    });
  }
});
