import React, { useState } from "react";
import { GitHubLink } from "@/components/githubLink";
import { IconButton } from "./iconButton";
import { TextButton } from "./textButton";
import { SecretTextInput } from "./secretTextInput";
import { Message } from "@/features/messages/messages";
import { Link } from "./link";
import { setLan, TLangs } from "@/i18n";
import { useI18n } from "@/components/I18nProvider";

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
  const [chatbotBackend, setChatbotBackend] = useState(localStorage.getItem("chatvrm_chatbot_backend") ?? "chatgpt");
  const [openAIApiKey, setOpenAIApiKey] = useState(atob(localStorage.getItem("chatvrm_openai_apikey") ?? ""));
  const [ttsBackend, setTTSBackend] = useState(localStorage.getItem("chatvrm_tts_backend") ?? "elevenlabs");
  const [elevenlabsApiKey, setElevenlabsApiKey] = useState(atob(localStorage.getItem("chatvrm_elevenlabs_apikey") ?? ""));

  return (
    <div className="absolute z-40 h-full w-full bg-white/80 backdrop-blur ">
      <div className="absolute m-24">
        <IconButton
          iconName="24/Close"
          isProcessing={false}
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
          )}

          <div className="my-24">
            <div className="my-16 font-bold typography-20">
              Text to Speech
            </div>
            <div className="my-8">
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
                disabled={chatbotBackend === 'silero'}
                >
                Silero
              </TextButton>
            </div>
          </div>

          { ttsBackend === 'elevenlabs' && (
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
          )}

          <div className="my-40">
            <div className="my-16 font-bold typography-20">
              {lang.SettingsCharacterModel}
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
