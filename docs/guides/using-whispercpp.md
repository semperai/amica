---
title: Using Whisper.cpp
order: 6
---

You can find the full whisper.cpp documentation [here](https://github.com/ggerganov/whisper.cpp/blob/master/README.md).


## Step 1 - Clone the repo

```bash
git clone https://github.com/ggerganov/whisper.cpp
cd whisper.cpp
```

## Step 2 - Download the model

```bash
./models/download-ggml-model.sh base.en
```

## Step 3 - Build the server

```bash
make server
```

## Step 4 - Run the server

```bash
./server -m models/ggml-base.en.bin
```

## Step 5 - Enable the server in the client

```md
settings -> Speech-to-text -> STT Backend -> Whisper.cpp
```
