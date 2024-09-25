---
title: Using Retrieval-based Voice Conversion (RVC)
order: 15
---

You can find the full documentation for this project on [SocAIty/Retrieval-based-Voice-Conversion-FastAPI](https://github.com/SocAIty/Retrieval-based-Voice-Conversion-FastAPI).

## Setting Up RVC Locally

## Step 1 - Clone the repository

Clone the repository and navigate to the project directory.

```bash
git clone git@github.com:SocAIty/Retrieval-based-Voice-Conversion-FastAPI.git rvc
cd rvc
```

## Step 2 - Run the setup script

Execute the `run.sh` script to set up the environment.

```bash
sh ./run.sh
```

## Step 3 - Open and disconnect the web interface

After running the script, the inference web interface will open. You can disconnect it once it's loaded.

## Step 4 - Modify `rvc_fastapi.py` for CORS support

To allow CORS (Cross-Origin Resource Sharing), add the following two lines to `rvc_fastapi.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(CORSMiddleware, allow_origins=["*"])
```

## Step 5 - Place your model files in the `logs` and `assets/weights` directories

You can get voice models from [voice-models.com](https://voice-models.com/).

Ensure the `rvc/logs` directory contains the following file:
- **Index file**: The index file for your voice model, named something like `added_IVF1377_Flat_nprobe_1_{model_name}_v2.index`.

Ensure the `rvc/assets/weights` directory contains the following file:
- **Model file**: The voice model file, with the extension `.pth`, for example `{model_name}.pth`.

## Step 6 - Run the FastAPI server

Once the changes are made and the model is placed in the appropriate directories, run the FastAPI server using the following command:

```bash
python rvc_fastapi.py
```

## Make sure RVC is enabled alongside other TTS systems

```bash
Settings -> Text-to-Speech -> RVC
```