---
title: Using LLaVA with LLaMA.cpp
order: 2
---

LLaVA / BakLLaVA can be used with [LLaMA.cpp](https://github.com/ggerganov/llama.cpp).

You can find the full llama.cpp documentation [here](https://github.com/ggerganov/llama.cpp/blob/master/README.md).


## Step 1 - Clone the repo

```bash
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
```

## Step 2 - Download the model

For example, we will use BakLLaVA-1 model, which is what is used on the demo instance.

Navigate to [mys/ggml_bakllava-1](https://huggingface.co/mys/ggml_bakllava-1) and download either `q4` or `q5` quant, as well as the `mmproj-model-f16.gguf` file.

The `mmproj-model-f16.gguf` file is necessary for the vision model.

## Step 3 - Build the server

```bash
make server
```

## Step 4 - Run the server

Read the [llama.cpp](https://github.com/ggerganov/llama.cpp/blob/master/README.md) documentation for more information on the server options. Or run `./server --help`.

```bash
./server -t 4 -c 4096 -ngl 35 -b 512 --mlock -m models/openchat_3.5.Q5_K_M.gguf --mmproj models/mmproj-model-f16.gguf
```

## Step 5 - Enable the server in the client

```md
settings -> Vision -> Vision Backend -> LLaMA.cpp
```
