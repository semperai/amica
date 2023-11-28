---
title: Using Ollama
order: 3
---

You can find the full Ollama documentation [here](https://github.com/jmorganca/ollama/tree/main/docs).


## Step 1 - Install Ollama

### Linux and WSL2

```bash
curl https://ollama.ai/install.sh | sh
```

### Mac OSX

[Download](https://ollama.ai/download/Ollama-darwin.zip)

### Windows

Not yet supported

## Step 2 - Start the server

```bash
ollama serve
```

## Step 3 - Download a model

For example, we will use Mistral 7B. There are many models to choose from listed in [the library](https://ollama.ai/library).

```bash
ollama run mistral
```

## Step 4 - Enable the server in the client

```md
settings -> ChatBot -> ChatBot Backend -> Ollama
```
