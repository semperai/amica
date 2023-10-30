/* eslint-disable camelcase */
import { pipeline, env } from "@xenova/transformers";

// Disable local models
env.allowLocalModels = false;

// Define model factories
// Ensures only one model is created of each type
class PipelineFactory {
  static task = null;
  static model = null;
  static quantized = null;
  static instance = null;

  constructor(tokenizer, model, quantized) {
    this.tokenizer = tokenizer;
    this.model = model;
    this.quantized = quantized;
  }

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      this.instance = pipeline(this.task, this.model, {
        quantized: this.quantized,
        progress_callback,
      });
    }

    return this.instance;
  }
}

self.addEventListener("message", async (event) => {
  const message = event.data;

  // Do some work...
  // 'cmu_us_slt_arctic-wav-arctic_a0001.bin'
  // 'speaker_embeddings.bin',
  let audio = await tts(
    message.text,
    message.speaker_embeddings,
  );
  if (audio === null) return;

  // Send the result back to the main thread
  self.postMessage({
    status: "complete",
    task: "text-to-speech",
    data: audio,
  });
});

class TextToSpeechPipelineFactory extends PipelineFactory {
  static task = "text-to-speech";
  static model = "Xenova/speecht5_tts";
  static quantized = null;
}

const tts = async (text, speaker_embeddings) => {
  const p = TextToSpeechPipelineFactory;

  // Load tts model
  let m = await p.getInstance((data) => {
    self.postMessage(data);
  });

  // Inject custom callback function to handle merging of chunks
  function callback_function(item) {
    self.postMessage({
      status: "update",
      task: "text-to-speech",
      data: data,
    });
  }

  // Actually run tts
  let output = await m(text, {
    speaker_embeddings,
    callback_function: callback_function, // after each generation step
  }).catch((error) => {
    self.postMessage({
      status: "error",
      task: "text-to-speech",
      data: error,
    });
    return null;
  });

  return output;
};
