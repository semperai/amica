# Deployment Guide: Running Amica Locally

This guide provides step-by-step instructions for setting up and running the Rust-powered version of Amica on your local machine.

## 1. Prerequisites

Before you begin, you need to have the following software installed on your system:

*   **Node.js:** Amica's user interface is built with Node.js. You will need version `18.18.0` or newer. You can download it from the [official Node.js website](https://nodejs.org/).
*   **Rust:** The new backend is written in Rust. The easiest way to install Rust is by using `rustup`. You can find instructions at the [official Rust website](https://www.rust-lang.org/tools/install).
*   **`text-generation-webui`:** You must have a working, pre-compiled version of `text-generation-webui`. You can find releases and setup instructions on its [GitHub repository](https://github.com/oobabooga/text-generation-webui). Make sure you can run it successfully on its own before integrating it with Amica.
*   **(Linux Only) Build Dependencies:** On Linux, you will need to install a few extra packages for Tauri to build correctly. You can install them with the following command:
    ```bash
    sudo apt-get update
    sudo apt-get install -y libwebkit2gtk-4.0-dev build-essential curl wget libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
    ```

## 2. Installation and Configuration

Follow these steps to get the Amica project set up.

#### Step 1: Clone the Amica Repository

Open your terminal, navigate to where you want to store the project, and run the following command:

```bash
git clone https://github.com/semperai/amica
cd amica
```

#### Step 2: Install JavaScript Dependencies

Once you are in the `amica` directory, run this command to install all the necessary frontend packages:

```bash
npm install
```

#### Step 3: Configure the `text-generation-webui` Path

The application needs to know where to find your `text-generation-webui` executable. This is configured using a `settings.json` file.

1.  In the root of the `amica` project directory, you will find a `settings.json` file. For the final packaged application, you must place this `settings.json` file in the same directory as the Amica executable.
2.  Open the file. It will look like this:
    ```json
    {
      "text_generation_webui_path": ""
    }
    ```
3.  Add the **full path** to your executable inside the quotes.

    *   **Windows Example:**
        ```json
        {
          "text_generation_webui_path": "C:\\Users\\YourUser\\Desktop\\text-generation-webui\\start.bat"
        }
        ```
        *(Note the double backslashes `\\`)*

    *   **Linux/macOS Example:**
        ```json
        {
          "text_generation_webui_path": "/home/youruser/text-generation-webui/start.sh"
        }
        ```

> **Important Note:** Amica always reads `settings.json` from the **current working directory (CWD)** from which it is launched. It does not use OS-specific configuration paths (e.g., `%APPDATA%` or `~/.config`). This applies to both development runs (`npm run tauri dev`) and when running the final packaged application. For the packaged application, this usually means placing `settings.json` next to the executable file.

## 3. Building the Application

Now that everything is configured, you can build the final, standalone executable.

Run the following command in your terminal. This process will compile the Rust backend and package it with the frontend into a single application. It may take several minutes.

```bash
npm run tauri build
```

Once the build is complete, you will find the final application inside the `src-tauri/target/release/` directory. It will be a `.exe` file on Windows, a `.AppImage` on Linux, or a `.app` file inside a `.dmg` on macOS.

## 4. Running Amica

You can now run this executable file directly! There is no need for any further commands.

On the first run, be sure to open the in-app settings and configure the following:
*   **Chatbot Backend:** Select **KoboldAI**.
*   **Streaming/Extra Option:** If you see an option for streaming, make sure it is **disabled**.

That's it! Your self-contained, Rust-powered Amica application is now ready to use.
