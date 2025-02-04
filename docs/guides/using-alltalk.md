---
title: Using AllTalk
order: 14
---

You can find the full AllTalk documentation [here](https://github.com/erew123/alltalk_tts/wiki).
Navigate to [AllTalk](https://github.com/erew123/alltalk_tts) and follow the instructions below to set up standalone AllTalk version 2.

## Setting Up Standalone AllTalk Version 2

### Windows Instructions

For manual setup, follow the official instructions provided [here](https://github.com/erew123/alltalk_tts/wiki/Install-%E2%80%90-Standalone-Installation).

Do not install this inside another existing Python environments folder.

1. Open Command Prompt and navigate to your preferred directory:
    ```bash
    cd /d C:\path\to\your\preferred\directory
    ```
    
2. Clone the AllTalk repository:
    ```bash
    git clone -b alltalkbeta https://github.com/erew123/alltalk_tts
    ```

3. Navigate to the AllTalk directory:
    ```bash
    cd alltalk_tts
    ```

4. Run the setup script:
    ```bash
    atsetup.bat
    ```

5. Follow the on-screen prompts:
* Select Standalone Installation and then Option 1.
* Follow any additional instructions to install required files.
* Known installation Errors & fixes are in the [Error-Messages-List Wiki](https://github.com/erew123/alltalk_tts/wiki/Error-Messages-List)

### Linux Instructions

1. Open a terminal and navigate to your preferred directory:
    ```bash
    cd /path/to/your/preferred/directory
    ```

2. Clone the AllTalk repository:s
    ```bash
    git clone -b alltalkbeta https://github.com/erew123/alltalk_tts
    ```

3. Navigate to the AllTalk directory:
    ```bash
    cd alltalk_tts
    ```

4. Run the setup script:
    ```bash
    ./atsetup.bat
    ```

5. Follow the on-screen prompts:
* Select Standalone Installation and then Option 1.
* Follow any additional instructions to install required files.
* Known installation Errors & fixes are in the [Error-Messages-List Wiki](https://github.com/erew123/alltalk_tts/wiki/Error-Messages-List)

## Make sure AllTalk is enabled for TTS:

```bash
Settings -> Text-to-Speech -> TTS Backend -> AllTalk
```

### Notes
- AllTalk can be used as a local text-to-speech backend in your application.
- For further details, refer to the official [AllTalk GitHub repository](https://github.com/erew123/alltalk_tts).