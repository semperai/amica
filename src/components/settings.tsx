import { GetStaticProps } from "next";
import React, { useContext, useState } from "react";
import { buildUrl } from "@/utils/buildUrl";
import { GitHubLink } from "@/components/githubLink";
import { IconButton } from "./iconButton";
import { TextButton } from "./textButton";
import { SecretTextInput } from "./secretTextInput";
import { TextInput } from "./textInput";
import { Message } from "@/features/messages/messages";
import { ViewerContext } from "@/features/vrmViewer/viewerContext";
import { Link } from "./link";
import { setLan, TLangs } from "@/i18n";
import { useI18n } from "@/components/I18nProvider";
import { config, updateConfig, resetConfig } from "@/utils/config";
import { bgImages, vrmList } from "@/paths";


const chatbotBackends = [
  {key: "echo",       label: "Echo"},
  {key: "chatgpt",    label: "ChatGPT"},
];

const ttsEngines = [
  {key: "none",       label: "None"},
  {key: "elevenlabs", label: "ElevenLabs"},
  {key: "speecht5",   label: "SpeechT5"},
];

function thumbPrefix(path: string) {
  const a = path.split("/");
  a[a.length - 1] = "thumb-" + a[a.length - 1];
  return a.join("/");
}

type Props = {
  systemPrompt: string;
  chatLog: Message[];
  onClickClose: () => void;
  onChangeSystemPrompt: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onChangeChatLog: (index: number, text: string) => void;
  onClickOpenVrmFile: () => void;
  onClickResetChatLog: () => void;
  onClickResetSystemPrompt: () => void;
};
export const Settings = ({
  chatLog,
  systemPrompt,
  onClickClose,
  onChangeSystemPrompt,
  onChangeChatLog,
  onClickOpenVrmFile,
  onClickResetChatLog,
  onClickResetSystemPrompt,
}: Props) => {
  const lang = useI18n();
  const lan = config("language") as TLangs;
  const { viewer } = useContext(ViewerContext);

  const [chatbotBackend, setChatbotBackend] = useState(config("chatbot_backend"));
  const [openAIApiKey, setOpenAIApiKey] = useState(config("openai_apikey"));
  const [openAIUrl, setOpenAIUrl] = useState(config("openai_url"));
  const [openAIModel, setOpenAIModel] = useState(config("openai_model"));

  const [ttsBackend, setTTSBackend] = useState(config("tts_backend"));
  const [elevenlabsApiKey, setElevenlabsApiKey] = useState(config("elevenlabs_apikey"));
  const [elevenlabsVoiceId, setElevenlabsVoiceId] = useState(config("elevenlabs_voiceid"));

  const [speechT5SpeakerEmbeddingsUrl, setSpeechT5SpeakerEmbeddingsUrl] = useState(config("speecht5_speaker_embedding_url"));


  const [bgUrl, setBgUrl] = useState(config("bg_url"));
  const [vrmUrl, setVrmUrl] = useState(config("vrm_url"));


  return (
    <div className="absolute z-40 h-full w-full bg-white/80 backdrop-blur ">
      <div className="absolute m-24">
        <IconButton
          iconName="24/Close"
          isProcessing={false}
          className="bg-secondary hover:bg-secondary-hover active:bg-secondary-active"
          onClick={onClickClose} />
      </div>
      <div className="max-h-full overflow-auto">
        <div className="mx-auto max-w-3xl px-24 py-64 text-text1 ">
          <div className="my-24 font-bold typography-32">
            Settings
          </div>

          <div className="my-24">
            <p className="mx-8 my-4 p-2 text-xs">Click this to reset all settings to default.</p>
            <TextButton
              onClick={() => {
                resetConfig();
                window.location.reload();
              }}
              className="mx-4 text-xs bg-secondary hover:bg-secondary-hover active:bg-secondary-active"
              >
              Reset All Settings
            </TextButton>
          </div>
            

          <div className="my-24">
            <div className="my-16 font-bold typography-20">
              Chatbot Backend
            </div>
            <div className="my-8">
              {chatbotBackends.map((engine) => (
                <TextButton
                  key={engine.key}
                  onClick={() => {
                    setChatbotBackend(engine.key);
                    updateConfig("chatbot_backend", engine.key);
                  }}
                  className="mx-4"
                  disabled={chatbotBackend === engine.key}
                  >
                  {engine.label}
                </TextButton>
              ))}
            </div>
          </div>
          
          { chatbotBackend === 'chatgpt' && (
            <>
              <div className="my-24">
                <div className="my-16 font-bold typography-16">
                  OpenAI API Key
                </div>
                <SecretTextInput
                  value={openAIApiKey}
                  onChange={(event: React.ChangeEvent<any>) => {
                    setOpenAIApiKey(event.target.value);
                    updateConfig("openai_apikey", event.target.value);
                  }}
                />
              </div>
              <div className="my-24">
                <div className="my-16 font-bold typography-16">
                  OpenAI URL
                </div>
                <TextInput
                  value={openAIUrl}
                  onChange={(event: React.ChangeEvent<any>) => {
                    setOpenAIUrl(event.target.value);
                    updateConfig("openai_url", event.target.value);
                  }}
                />
              </div>
              <div className="my-24">
                <div className="my-16 font-bold typography-16">
                  OpenAI Model
                </div>
                <TextInput
                  value={openAIModel}
                  onChange={(event: React.ChangeEvent<any>) => {
                    setOpenAIModel(event.target.value);
                    updateConfig("openai_model", event.target.value);
                  }}
                />
              </div>
            </>
          )}

          <div className="my-24">
            <div className="my-16 font-bold typography-20">
              Text to Speech
            </div>
            <div className="my-8">
              {ttsEngines.map((engine) => (
                <TextButton
                  key={engine.key}
                  onClick={() => {
                    setTTSBackend(engine.key);
                    updateConfig("tts_backend", engine.key);
                  }}
                  className="mx-4"
                  disabled={ttsBackend === engine.key}
                  >
                  {engine.label}
                </TextButton>
              ))}
            </div>
          </div>

          { ttsBackend === 'elevenlabs' && (
            <>
              <div className="my-24">
                <div className="my-16 font-bold typography-16">
                  ElevenLabs API Key
                </div>
                <SecretTextInput
                  value={elevenlabsApiKey}
                  onChange={(event: React.ChangeEvent<any>) => {
                    setElevenlabsApiKey(event.target.value);
                    updateConfig("elevenlabs_apikey", event.target.value);
                  }}
                />
              </div>
              <div className="my-24">
                <div className="my-16 font-bold typography-16">
                  ElevenLabs Voice ID
                </div>
                <TextInput
                  value={elevenlabsVoiceId}
                  onChange={(event: React.ChangeEvent<any>) => {
                    setElevenlabsVoiceId(event.target.value);
                    updateConfig("elevenlabs_voiceid", event.target.value);
                  }}
                />
              </div>
            </>
          )}

          { ttsBackend === 'speecht5' && (
            <>
              <div className="my-24">
                <div className="my-16 font-bold typography-16">
                  SpeechT5 Speaker Embeddings URL
                </div>
                <TextInput
                  value={speechT5SpeakerEmbeddingsUrl}
                  onChange={(event: React.ChangeEvent<any>) => {
                    setSpeechT5SpeakerEmbeddingsUrl(event.target.value);
                    updateConfig("speecht5_speaker_embedding_url", event.target.value);
                  }}
                />
              </div>
            </>
          )}

          <div className="my-24">
            <div className="my-16 font-bold typography-20">
              Background
            </div>
            <div className="my-8">
              { bgImages.map((url) =>
                <TextButton
                  key={url}
                  onClick={() => {
                    document.body.style.backgroundImage = `url(${url})`;
                    updateConfig("bg_url", url);
                    setBgUrl(url);
                  }}
                  className={"mx-4 pt-0 pb-0 pl-0 pr-0 shadow-sm shadow-black hover:shadow-md hover:shadow-black rounded-4 transition-all " + (bgUrl === url ? "opacity-100 shadow-md" : "opacity-60 hover:opacity-100")}
                  >
                    <img src={`${thumbPrefix(url)}`} width="160" height="93" className="m-0 rounded-4" />
                </TextButton>
              )}
            </div>
          </div>

          <div className="my-40">
            <div className="my-16 font-bold typography-20">
              Character Model
            </div>
            <div className="my-8">
              {vrmList.map((url) =>
                <TextButton
                  key={url}
                  onClick={() => {
                    viewer.loadVrm(url);
                    updateConfig("vrm_url", url);
                    setVrmUrl(url);
                  }}
                  className={"mx-4 pt-0 pb-0 pl-0 pr-0 shadow-sm shadow-black hover:shadow-md hover:shadow-black rounded-4 transition-all " + (vrmUrl === url ? "opacity-100 shadow-md" : "opacity-60 hover:opacity-100")}
                  >
                    <img src={`${thumbPrefix(url)}.jpg`} width="160" height="93" className="m-0 rounded-4" />
                </TextButton>
              )}
            </div>
            <div className="my-8">
              <TextButton onClick={onClickOpenVrmFile}>
                Load .VRM
              </TextButton>
            </div>
          </div>

          <div className="my-40">
            <div className="my-16 font-bold typography-20">
              System Prompt
            </div>
            <textarea
              value={systemPrompt}
              onChange={onChangeSystemPrompt}
              className="h-168 w-full  rounded-8 bg-surface1 px-16 py-8 hover:bg-surface1-hover"></textarea>
          </div>

          {chatLog.length > 0 && (
            <div className="my-40">
              <div className="my-16 font-bold typography-20">
                Conversation Log
              </div>
              <div className="my-8">
                {chatLog.map((value, index) => {
                  return (
                    <div
                      key={index}
                      className="my-8 grid grid-flow-col  grid-cols-[min-content_1fr] gap-x-fixed">
                      <div className="w-[64px] py-8">
                        {value.role === "assistant" ? "Amica" : "You"}
                      </div>
                      <input
                        key={index}
                        className="w-full rounded-8 bg-surface1 px-16 py-8 hover:bg-surface1-hover"
                        type="text"
                        value={value.content}
                        onChange={(event) => {
                          onChangeChatLog(index, event.target.value);
                        }}></input>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="my-24">
            <GitHubLink />
          </div>
        </div>
      </div>
    </div>
  );
};
