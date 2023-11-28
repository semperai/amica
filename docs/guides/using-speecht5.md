---
title: Using SpeechT5
order: 11
---

SpeechT5 is a built-in text-to-speech (TTS) service that runs in the browser (Well, on Amica at least). It is free and relatively fast.

Make sure SpeechT5 is enabled for TTS:

```bash
Settings -> Text-to-Speech -> TTS Backend -> SpeechT5
```

### Using SpeechT5

You can add new voices to SpeechT5 by adding new models to `./public/speecht5_speaker_embeddings/.private` and running `npm run generate:paths`. You can download additional xvectors for SpeechT5 from [here](https://huggingface.co/datasets/Xenova/cmu-arctic-xvectors-extracted).
