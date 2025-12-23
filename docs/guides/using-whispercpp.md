---
title: Using Whisper.cpp
order: 6
---

You can find the full whisper.cpp documentation [here](https://github.com/ggml-org/whisper.cpp/blob/master/README.md).


## Step 1 - Clone the repo

```bash
git clone https://github.com/ggml-org/whisper.cpp
```

```bash
cd whisper.cpp
```

## Step 2 - Download the model

```bash
./models/download-ggml-model.sh base.en
```

## Step 3 - Run the server

```bash
./build/bin/whisper-server -m models/ggml-base.en.bin
```

## Step 4 - Enable the server in the client

```md
settings -> Speech-to-text -> STT Backend -> Whisper.cpp
```