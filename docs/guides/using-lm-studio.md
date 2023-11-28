---
title: Using LM Studio
order: 1
---

You can find the full LM Studio documentation [here](https://lmstudio.ai/).


## Step 1 - Install LM Studio

Navigate to [the LM Studio website](https://lmstudio.ai/) and follow the instructions to install the GUI.

## Step 2 - Download a model

Using the GUI, download a model from the LM Studio library. If you don't know which to pick, try `TheBloke/openchat_3.5.gguf` version `openchat_3.5.Q5.K_M.gguf`.

## Step 3 - Start the server

On the left side of the GUI, click the "Local Server" button. Then, in the dropdown on the top of the screen, select the model you downloaded.

Next, in the Server Options pane, ensure that Cross-Origin-Resource-Sharing (CORS) is enabled.

Finally, click "Start Server".

## Step 4 - Enable the server in the client

First select `ChatGPT` as the backend in the client:

```md
settings -> ChatBot -> ChatBot Backend -> ChatGPT
```

Then configure `ChatGPT` to use the LM Studio server:


```md
settings -> ChatBot -> ChatGPT

```

Set `OpenAI URL` to `http://localhost:8080` and `OpenAI Key` to `default`. If you changed the port in the LM Studio GUI, use that port instead of `8080`.
