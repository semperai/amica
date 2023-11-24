#!/usr/bin/env bash

trap "kill 0" EXIT

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


cd ${ROOT_DIR}/working/llama.cpp
./server -t 4 -c 4096 -ngl 35 -b 512 --mlock -m "./models/openchat_3.5.Q5_K_M.gguf" &

cd ${ROOT_DIR}/working/basic-openai-api-wrapper
source venv/bin/activate
flask run &

cd ${ROOT_DIR}
npm run start &

until $(curl --output /dev/null --silent --head --fail http://localhost:3000); do
    printf '.'
    sleep 1
done
until $(curl --output /dev/null --silent --head --fail http://localhost:8080); do
    printf '.'
    sleep 1
done
# until $(curl --output /dev/null --silent --head --fail http://localhost:5000); do
#     printf '.'
#     sleep 1
# done

open http://localhost:3000


wait
