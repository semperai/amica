---
title: Using KoboldCpp
order: 5
---

You can find the full KoboldCpp documentation [here](https://github.com/LostRuins/koboldcpp/blob/concedo/README.md).


## Step 1 - Clone the repo

```bash
git clone https://github.com/LostRuins/koboldcpp
cd koboldcpp
```

## Step 2 - Download the model

For example, we will use OpenChat 3.5 model, which is what is used on the demo instance. There are many models to choose from.

Navigate to [TheBloke/openchat_3.5-GGUF](https://huggingface.co/TheBloke/openchat_3.5-GGUF) and download one of the models, such as `openchat_3.5.Q5_K_M.gguf`. Place this file inside the `./models` directory.

## Step 3 - Build KoboldCpp

```bash
make
```

## Step 4 - Run the server

```bash
./koboldcpp.py ./models/openchat_3.5.Q5_K_M.gguf
```

## Step 5 - Enable the server in the client

First select `KoboldCpp` as the backend in the client:

```md
settings -> ChatBot -> ChatBot Backend -> KoboldCpp
```

Then configure `KoboldCpp`:

```md
settings -> ChatBot -> KoboldCpp
```

Inside of "Use KoboldCpp" ensure that "Use Extra" is enabled. This will allow you to use the extra features of KoboldCpp, such as streaming.
