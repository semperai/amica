#!/usr/bin/env bash

INSTALL_SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
ROOT_DIR="${INSTALL_SCRIPT_DIR}/.."


printf "Detecting OS: "
if [ "$(uname)" == "Darwin" ]; then
    printf "\e[32mOSX\e[m\n"
else
    printf "\e[31m${$(uname)}\e[m\n"
    printf "\e[31mERROR:\e[m This script only works on OSX\n"
    exit 1
fi


echo "Root directory: ${ROOT_DIR}"

printf "Detecting brew: "
if command -v brew &> /dev/null; then
    printf "\e[32mfound\e[m\n"
else
    printf "\e[31mnot found\e[m\n"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

printf "Detecting git: "
if command -v git &> /dev/null; then
    printf "\e[32mfound\e[m\n"
else
    printf "\e[31mnot found\e[m\n"
    brew install git
fi

printf "Detecting nvm: "
if [ -d "${HOME}/.nvm/.git" ]; then
    printf "\e[32mfound\e[m\n"
else
    printf "\e[31mnot found\e[m\n"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh)"
    exit 1
fi

echo "Building amica"
cd "${ROOT_DIR}"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install
nvm use
npm install
npm run build


mkdir -p "${ROOT_DIR}/working"


if [ -d "${ROOT_DIR}/working/llama.cpp" ]; then
    echo "Llama.cpp exists"
else
    git clone https://github.com/ggerganov/llama.cpp "${ROOT_DIR}/working/llama.cpp"
fi

echo "Building llama.cpp"
cd "${ROOT_DIR}/working/llama.cpp"
make server -j

echo "Downloading OpenChat 3.5"
curl -L "https://huggingface.co/TheBloke/openchat_3.5-GGUF/resolve/main/openchat_3.5.Q5_K_M.gguf?download=true" -o "${ROOT_DIR}/working/llama.cpp/models/openchat_3.5.Q5_K_M.gguf"


if [ -d "${ROOT_DIR}/working/basic-openai-api-weapper" ]
then
    echo "basic-openai-api-wrapper exists"
else
    git clone https://github.com/semperai/basic-openai-api-wrapper.git "${ROOT_DIR}/working/basic-openai-api-wrapper"
fi

echo "Building basic-openai-api-wrapper"
cd "${ROOT_DIR}/working/basic-openai-api-wrapper"
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
