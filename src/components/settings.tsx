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

const bgImages = [
  "bg-landscape1.jpg",
  "bg-landscape2.jpg",
  "bg-landscape3.jpg",
  "bg-sunset1.jpg",
  "bg-forest1.jpg",
  "bg-town1.jpg",
  "bg-room1.jpg",
  "bg-room2.jpg",
]

const vrmList = [
  "AvatarSample_A.vrm",
  "AvatarSample_B.vrm",
  "AvatarSample_C.vrm",
];

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
  const lan = (localStorage.getItem("chatvrm_language") ?? "en") as TLangs;
  const { viewer } = useContext(ViewerContext);

  const [chatbotBackend, setChatbotBackend] = useState(localStorage.getItem("chatvrm_chatbot_backend") ?? "echo");
  const [openAIApiKey, setOpenAIApiKey] = useState(atob(localStorage.getItem("chatvrm_openai_apikey") ?? ""));
  const [openAIUrl, setOpenAIUrl] = useState(localStorage.getItem("chatvrm_openai_url") ?? "https://api.openai.com");
  const [openAIModel, setOpenAIModel] = useState(localStorage.getItem("chatvrm_openai_model") ?? "gpt-3.5-turbo");

  const [ttsBackend, setTTSBackend] = useState(localStorage.getItem("chatvrm_tts_backend") ?? "none");
  const [elevenlabsApiKey, setElevenlabsApiKey] = useState(atob(localStorage.getItem("chatvrm_elevenlabs_apikey") ?? ""));
  const [elevenlabsVoiceId, setElevenlabsVoiceId] = useState(atob(localStorage.getItem("chatvrm_elevenlabs_voiceid") ?? btoa("GTYtUrlPOOn3WGf39gSO")));

  const [sileroUrl, setSileroUrl] = useState(localStorage.getItem("chatvrm_silero_url") ?? "http://127.0.0.1:8001");
  const [sileroSessionPath, setSileroSessionPath] = useState(localStorage.getItem("chatvrm_silero_sessionpath") ?? "/tmp");
  const [sileroVoiceId, setSileroVoiceId] = useState(localStorage.getItem("chatvrm_silero_voiceid") ?? "en_42");


  const [bgUrl, setBgUrl] = useState(localStorage.getItem("chatvrm_bg_url") ?? bgImages[0]);
  const [vrmUrl, setVrmUrl] = useState(localStorage.getItem("chatvrm_vrm_url") ?? vrmList[0]);


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
            {lang.Settings}
          </div>

          <div className="my-40">
            <div className="my-8">
              <TextButton
                onClick={() => {
                  setLan("cn");
                  location.reload();
                }}
                className="mx-4"
                disabled={lan === 'cn'}
                >
                中国語
              </TextButton>
              <TextButton
                onClick={() => {
                  setLan("jp");
                  location.reload();
                }}
                className="mx-4"
                disabled={lan === 'jp'}
                >
                日文
              </TextButton>
              <TextButton
                onClick={() => {
                  setLan("en");
                  location.reload();
                }}
                className="mx-4"
                disabled={lan === 'en'}
                >
                English
              </TextButton>
            </div>
          </div>


          <div className="my-24">
            <div className="my-16 font-bold typography-20">
              Chatbot Backend
            </div>
            <div className="my-8">
              <TextButton
                onClick={() => {
                  setChatbotBackend("echo");
                  localStorage.setItem("chatvrm_chatbot_backend", "echo");
                }}
                className="mx-4"
                disabled={chatbotBackend === 'echo'}
                >
                Echo
              </TextButton>
              <TextButton
                onClick={() => {
                  setChatbotBackend("chatgpt");
                  localStorage.setItem("chatvrm_chatbot_backend", "chatgpt");
                }}
                className="mx-4"
                disabled={chatbotBackend === 'chatgpt'}
                >
                ChatGPT
              </TextButton>
              <TextButton
                onClick={() => {
                  setChatbotBackend("claude");
                  localStorage.setItem("chatvrm_chatbot_backend", "claude");
                }}
                className="mx-4"
                disabled={chatbotBackend === 'claude'}
                >
                Claude
              </TextButton>
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
                    localStorage.setItem("chatvrm_openai_apikey", btoa(event.target.value));
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
                    localStorage.setItem("chatvrm_openai_url", event.target.value);
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
                    localStorage.setItem("chatvrm_openai_model", event.target.value);
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
              <TextButton
                onClick={() => {
                  setTTSBackend("none");
                  localStorage.setItem("chatvrm_tts_backend", "none");
                }}
                className="mx-4"
                disabled={ttsBackend === 'none'}
                >
                None
              </TextButton>
              <TextButton
                onClick={() => {
                  setTTSBackend("elevenlabs");
                  localStorage.setItem("chatvrm_tts_backend", "elevenlabs");
                }}
                className="mx-4"
                disabled={ttsBackend === 'elevenlabs'}
                >
                ElevenLabs
              </TextButton>
              <TextButton
                onClick={() => {
                  setTTSBackend("silero");
                  localStorage.setItem("chatvrm_tts_backend", "silero");
                }}
                className="mx-4"
                disabled={ttsBackend === 'silero'}
                >
                Silero
              </TextButton>
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
                    localStorage.setItem("chatvrm_elevenlabs_apikey", btoa(event.target.value));
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
                    localStorage.setItem("chatvrm_elevenlabs_voiceid", btoa(event.target.value));
                  }}
                />
              </div>
            </>
          )}

          { ttsBackend === 'silero' && (
            <>
              <div className="my-24">
                <div className="my-16 font-bold typography-16">
                  Silero URL
                </div>
                <TextInput
                  value={sileroUrl}
                  onChange={(event: React.ChangeEvent<any>) => {
                    setSileroUrl(event.target.value);
                    localStorage.setItem("chatvrm_silero_url", event.target.value);
                  }}
                />
              </div>
              <div className="my-24">
                <div className="my-16 font-bold typography-16">
                  Silero Session Path
                </div>
                <TextInput
                  value={sileroSessionPath}
                  onChange={(event: React.ChangeEvent<any>) => {
                    setSileroSessionPath(event.target.value);
                    localStorage.setItem("chatvrm_silero_sessionpath", event.target.value);
                  }}
                />
              </div>
              <div className="my-24">
                <div className="my-16 font-bold typography-16">
                  Silero Voice ID
                </div>
                <TextInput
                  value={sileroVoiceId}
                  onChange={(event: React.ChangeEvent<any>) => {
                    setSileroVoiceId(event.target.value);
                    localStorage.setItem("chatvrm_silero_voiceid", event.target.value);
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
                    localStorage.setItem("chatvrm_bg_url", url);
                    setBgUrl(url);
                  }}
                  className={"mx-4 pt-0 pb-0 pl-0 pr-0 shadow-sm shadow-black hover:shadow-md hover:shadow-black rounded-4 transition-all " + (bgUrl === url ? "opacity-100 shadow-md" : "opacity-60 hover:opacity-100")}
                  >
                    <img src={`thumb-${url}`} width="160" height="93" className="m-0 rounded-4" />
                </TextButton>
              )}
            </div>
          </div>


          <div className="my-40">
            <div className="my-16 font-bold typography-20">
              {lang.SettingsCharacterModel}
            </div>
            <div className="my-8">
              {vrmList.map((url) =>
                <TextButton
                  key={url}
                  onClick={() => {
                    viewer.loadVrm(url);
                    localStorage.setItem("chatvrm_vrm_url", url);
                    setVrmUrl(url);
                  }}
                  className={"mx-4 pt-0 pb-0 pl-0 pr-0 shadow-sm shadow-black hover:shadow-md hover:shadow-black rounded-4 transition-all " + (vrmUrl === url ? "opacity-100 shadow-md" : "opacity-60 hover:opacity-100")}
                  >
                    <img src={`thumb-${url}.jpg`} width="160" height="93" className="m-0 rounded-4" />
                </TextButton>
              )}
            </div>
            <div className="my-8">
              <TextButton onClick={onClickOpenVrmFile}>
                {lang.SettingsCharacterSelectBtn}
              </TextButton>
            </div>
          </div>

          <div className="my-40">
            <div className="my-16 font-bold typography-20">
              {lang.SettingsCharacterSettings}
            </div>
            <textarea
              value={systemPrompt}
              onChange={onChangeSystemPrompt}
              className="h-168 w-full  rounded-8 bg-surface1 px-16 py-8 hover:bg-surface1-hover"></textarea>
          </div>

          {chatLog.length > 0 && (
            <div className="my-40">
              <div className="my-16 font-bold typography-20">
                {lang.DaboardConversationLog}
              </div>
              <div className="my-8">
                {chatLog.map((value, index) => {
                  return (
                    <div
                      key={index}
                      className="my-8 grid grid-flow-col  grid-cols-[min-content_1fr] gap-x-fixed">
                      <div className="w-[64px] py-8">
                        {value.role === "assistant" ? "Character" : "You"}
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
