---
title: Using LLaMA.cpp
order: 2
---

You can find the full llama.cpp documentation [here](https://github.com/ggerganov/llama.cpp/blob/master/README.md).


## Step 1 - Clone the repo

```bash
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
```

## Step 2 - Download the model

For example, we will use OpenChat 3.5 model, which is what is used on the demo instance. There are many models to choose from.

Navigate to [TheBloke/openchat_3.5-GGUF](https://huggingface.co/TheBloke/openchat_3.5-GGUF) and download one of the models, such as `openchat_3.5.Q5_K_M.gguf`. Place this file inside the `./models` directory.

## Step 3 - Build the server

```bash
make server
```

## Step 4 - Run the server

Read the [llama.cpp](https://github.com/ggerganov/llama.cpp/blob/master/README.md) documentation for more information on the server options. Or run `./server --help`.

```bash
./server -t 4 -c 4096 -ngl 35 -b 512 --mlock -m models/openchat_3.5.Q5_K_M.gguf
```

## Step 5 - Enable the server in the client

```md
settings -> ChatBot -> ChatBot Backend -> LLaMA.cpp
```
