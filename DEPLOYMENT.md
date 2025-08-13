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
    > **Note:** This project uses Tauri v1, which requires `libwebkit2gtk-4.0-dev`. If you are working on a project with Tauri v2 or newer, you will need to use `libwebkit2gtk-4.1-dev` instead.

## 2. Installation and Configuration

Follow these steps to get the Amica project set up.

### Step 1: Clone the Amica Repository

Open your terminal, navigate to where you want to store the project, and run the following command:


Amica needs to know where to find your `text-generation-webui` executable. This is configured in a `settings.json` file.

##### How Configuration Works

Amica uses a default, bundled configuration file to start. To customize the settings, you must create your own `settings.json` file and place it in the correct application configuration directory for your operating system.

When Amica starts, it looks for `settings.json` in this order:
1.  **Your Custom `settings.json`:** It checks for the file in your OS's standard application config directory.
2.  **Default `settings.json`:** If no custom file is found, it falls back to the default settings bundled inside the application. The default has an empty path, so you **must** create a custom file.

##### Creating Your Custom `settings.json`

1.  First, you need to find your application's configuration directory. The paths are typically:
    *   **Windows:** `%APPDATA%\\com.heyamica.dev` (you can paste this into the Explorer address bar)
    *   **macOS:** `~/Library/Application Support/com.heyamica.dev`
    *   **Linux:** `~/.config/com.heyamica.dev`

    *(Note: The `com.heyamica.dev` directory might not exist until you run Amica at least once.)*

2.  Create a new file named `settings.json` inside that directory.

3.  Copy and paste the following content into your new `settings.json` file:
    ```json
    {
      "text_generation_webui_path": ""
    }
    ```

4.  Add the **full path** to your `text-generation-webui` executable inside the quotes.

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

If Amica ever has trouble starting, it will show a dialog box explaining the configuration error. This usually means there's a typo in your `settings.json` file or the path to the executable is incorrect.

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
