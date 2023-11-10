# Local Setup

This guide will result in everything being hosted on home computer. It assumes a recent MacBook or Linux machine.

## Local LLM Setup

We will use llama.cpp for local llm.

```bash
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
make server -j 4

# download https://huggingface.co/TheBloke/OpenHermes-2.5-Mistral-7B-GGUF/blob/main/openhermes-2.5-mistral-7b.Q5_K_M.gguf
# save this file into llama.cpp/models folder

# when the download is complete you can start the server and load the model
# you can save this command in a file called start_server.sh
./server -t 4 -c 4096 -ngl 35 -b 512 --mlock -m models/openhermes-2-mistral-7b.Q5_K_M.gguf
```

Now go to [http://127.0.0.1:8080](http://127.0.0.1:8080) in browser and test it works.


## Local Audio

We will use a simple http server which implements [Coqui TTS](https://github.com/coqui-ai/TTS) and [faster-whisper](https://github.com/guillaumekln/faster-whisper) with api endpoints matching OpenAIs.

```bash
git clone https://github.com/semperai/basic-openai-api-wrapper
cd basic-openai-api-wrapper
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python server.py
```

Now you have open ai compatible audio server running on 127.0.0.1:5000.

## Local Amica

```bash
# install nvm if you dont already have it
# https://github.com/nvm-sh/nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash


# now install amica
git clone https://github.com/semperai/amica
cd amica
nvm use # you may need to run 'nvm install'
npm install
npm run dev
```

Open your browser and go to [http://127.0.0.1:3000](http://127.0.0.1:3000).

Now, configure settings to use local services:

```markdown
settings -> chatbot -> chatbot backend:
    set `Chatbot Backend` to `llama.cpp`

settings -> chatbot -> llama.cpp:
    set `API URL` to `http://127.0.0.1:8080`

settings -> text-to-speech -> tts backend:
    set `TTS Backend` to `OpenAI TTS`

settings -> text-to-speech -> openai:
    set `API URL` to `http://127.0.0.1:5000`

settings -> speech-to-text -> stt backend:
    set `STT Backend` to `Whisper (OpenAI)`

settings -> speech-to-text -> whisper (openai):
    set `OpenAI URL` to `http://127.0.0.1:5000`
```

Test that everything works. If something doesn't, open the debug window or your developer console in web browser to see if you can see what the error is.