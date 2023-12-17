---
title: Using Oobabooga
order: 12
---

You can find the full Oobabooga documentation [here](https://github.com/oobabooga/text-generation-webui/wiki).


## Step 1 - Install Oobabooga

```bash
python3 -m venv venv
source venv/bin/activate
# choose correct requirements.txt for your system
pip install -r requirements.txt
# install the openai extension
pip install -r extensions/openai/requirements.txt
```

## Step 2 - Start the server

```bash
python server.py --api
```

## Step 3 - Configure Oobabooga

Open http://127.0.0.1:7860/ in your browser and configure the server.

Make sure you load the model in the "Model" tab.


## Step 4 - Enable the server in the client

Set ChatBot Backend to ChatGPT in the client settings:

```md
settings -> ChatBot -> ChatBot Backend -> ChatGPT
```

Next, set the **OpenAI URL** to `http://localhost:5000`


```md
settings -> ChatBot -> ChatGPT -> OpenAI URL -> http://localhost:5000
```
