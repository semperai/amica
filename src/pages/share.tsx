import { createHash } from 'crypto';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { config, defaults, updateConfig } from '@/utils/config';
import { isTauri } from '@/utils/isTauri';
import { FilePond, registerPlugin } from 'react-filepond';
import { ViewerContext } from "@/features/vrmViewer/viewerContext";
import VrmDemo from "@/components/vrmDemo";
import { loadVRMAnimation } from "@/lib/VRMAnimation/loadVRMAnimation";

import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';

import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import { vrmDataProvider } from "@/features/vrmStore/vrmDataProvider";
import { IconButton } from '@/components/iconButton';

import { RadioBox } from '@/components/radioBox';
import i18n from '@/i18n';

import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract} from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

import { abi } from '../utils/abi'


registerPlugin(
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType,
);

const blobToFile = (blob: Blob, fileName: string): File => {
  return new File([blob], fileName, { type: blob.type });
};


async function hashFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashValue = createHash('sha256')
    .update(Buffer.from(buffer))
    .digest('hex');
  return hashValue;
}

async function updateVrmAvatar(viewer: any, url: string) {
  try {
    await viewer.loadVrm(url);
  } catch (e) {
    console.error(e);
  }
}

function vrmDetector(source: File, type: string): Promise<string> {
  return new Promise((resolve, reject) => {
    console.log(source);
    (async () => {
      const ab = await source.arrayBuffer();
      const buf = Buffer.from(ab);
      if (buf.slice(0, 4).toString() === "glTF") {
        resolve("model/gltf-binary");
      } else {
        resolve("unknown");
      }
    })();
  })
}

export default function Share() {
  const { t } = useTranslation();
  const { viewer } = useContext(ViewerContext);

  const [description, setDescription] = useState('');
  const [name, setName] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [visionSystemPrompt, setVisionSystemPrompt] = useState('');
  const [bgUrl, setBgUrl] = useState('');
  const [thumbUrl, setThumbUrl] = useState('');
  const [youtubeVideoId, setYoutubeVideoId] = useState('');
  const [vrmUrl, setVrmUrl] = useState('');
  const [vrmHash, setVrmHash] = useState('');
  const [vrmSaveType, setVrmSaveType] = useState('');
  const [animationUrl, setAnimationUrl] = useState('');
  const [voiceUrl, setVoiceUrl] = useState('');

  const [bgFiles, setBgFiles] = useState([]);
  const [vrmFiles, setVrmFiles] = useState([]);
  const [thumbFiles, setThumbFiles] = useState<File[]>([]);
  const [animationFiles, setAnimationFiles] = useState([]);
  const [voiceFiles, setVoiceFiles] = useState([]);

  const [vrmLoaded, setVrmLoaded] = useState(false);
  const [vrmLoadedFromIndexedDb, setVrmLoadedFromIndexedDb] = useState(false);
  const [vrmLoadingFromIndexedDb, setVrmLoadingFromIndexedDb] = useState(false);
  const [showUploadLocalVrmMessage, setShowUploadLocalVrmMessage] = useState(false);


  const [sqid, setSqid] = useState('');

  const vrmUploadFilePond = useRef<FilePond | null>(null);

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  const [language, setLanguage] = useState('');
  const [agentId, setAgentId] = useState('');
  const [thumbData, setThumbData] = useState<File | null>(null);
  const [characterCreatorType, setCharacterCreatorType] = useState("Sharing");

  // Contract address and ABI for fetching metadata
  const CONTRACT_ADDRESS = "0xb11C162D5Ea52c899076B537d0Da9cFCe1489026";

  const wagmiContractConfig = {
    address: CONTRACT_ADDRESS,
    abi: [
      {
        type: 'function',
        name: 'getTokenIdCounter',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'uint256' }],
      }
    ]
  } as const

  const { isConnected } = useAccount();
  const { data : aid } = useReadContract({
    ...wagmiContractConfig,
    functionName: 'getTokenIdCounter',
    args: [],
  })

  const { data: hash, isPending, writeContract } = useWriteContract();
  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const filterKeys = [
    "tts_muted", "autosend_from_mic", "wake_word_enabled", "wake_word", 
    "time_before_idle_sec", "debug_gfx", "language", "show_introduction", 
    "show_add_to_homescreen", "animation_url", "voice_url",
    "bg_url", "vrm_url", "youtube_videoid", "system_prompt",
    "vision_system_prompt", "name"
  ];

  // State to manage the visibility of filteredDefaults
  const [showConfigs, setShowConfigs] = useState(false);
  const [filteredDefault, setFilterDefault] = useState<Record<string, any>>({});

  const handleConfigToggle = () => {
    const filteredDefaults = Object.entries(defaults)
        .filter(([key]) => !filterKeys.includes(key))
        .reduce((acc: Record<string, any>, [key, value]) => {
          acc[key] = config(key);
          return acc;
      }, {});
    setFilterDefault(filteredDefaults);
    setShowConfigs((prevState) => !prevState);
  };

  async function uploadVrmFromIndexedDb() {
    const blob = await vrmDataProvider.getItemAsBlob(vrmHash);
    if (vrmUploadFilePond.current && blob) {
      vrmUploadFilePond.current.addFile(blob).then(() => { setVrmLoadingFromIndexedDb(true); });
    } else {
      console.log("FilePond not loaded, retry in 0.5 sec");
      delay(500).then(uploadVrmFromIndexedDb);
    }
  }

  useEffect(() => {
    setName(config('name'));
    setSystemPrompt(config('system_prompt'));
    setVisionSystemPrompt(config('vision_system_prompt'));
    if (!config('bg_url').startsWith('data')) {
      setBgUrl(config('bg_url'));
    }
    setYoutubeVideoId(config('youtube_videoid'));
    setVrmUrl(config('vrm_url'));
    setVrmHash(config('vrm_hash'));
    setVrmSaveType(config('vrm_save_type'));
    setAnimationUrl(config('animation_url'));
    setVoiceUrl(config('voice_url'));
    setLanguage(config('language'));
  }, []);

  useEffect(() => {
    if (vrmLoadedFromIndexedDb) {
      vrmDataProvider.addItemUrl(vrmHash, vrmUrl);
      updateConfig('vrm_url', vrmUrl);
      updateConfig('vrm_save_type', 'web');
      setVrmSaveType('web');
    }
  }, [vrmLoadedFromIndexedDb]);

  useEffect(() => {
    setShowUploadLocalVrmMessage(vrmSaveType == 'local' && !vrmLoadedFromIndexedDb && !vrmLoadingFromIndexedDb);
  }, [vrmSaveType, vrmLoadedFromIndexedDb, vrmLoadingFromIndexedDb]);

  useEffect(() => {
    const uploadThumbnail = async () => {
      if (thumbData) { 
        setThumbFiles([thumbData]);
      }
    };
  
    uploadThumbnail();
  }, [thumbData]);
  

  const [isRegistering, setIsRegistering] = useState(false);
  async function registerCharacter() {
    setIsRegistering(true);

    async function register() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_AMICA_API_URL}/api/add_character`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description,
          name,
          system_prompt: systemPrompt,
          vision_system_prompt: visionSystemPrompt,
          bg_url: bgUrl,
          youtube_videoid: youtubeVideoId,
          vrm_url: vrmUrl,
          animation_url: animationUrl,
          voice_url: voiceUrl,
        }),
      });

      const data = await res.json();
      console.log('response', data);

      setSqid(data.sqid);

      setIsRegistering(false);
    }

    register();
  }

  const [isMinting, setIsMinting] = useState(false);
  async function mintCharacter() {
    try {
      setIsMinting(true);

      const filteredDefaults = Object.entries(defaults)
        .filter(([key]) => !filterKeys.includes(key))
        .reduce((acc: Record<string, any>, [key, value]) => {
          acc[key] = config(key);
          return acc;
      }, {});

      setFilterDefault(filteredDefaults);

      let keysList = Object.keys(filteredDefaults);
      let valuesList = Object.values(filteredDefaults);

      const lateAssignKeys = ["name","description","image","bg_url","youtube_videoid","vrm_url","animation_url","system_prompt","vision_system_prompt"];
      const lateAssignValues = [name, description, thumbUrl, bgUrl, youtubeVideoId, vrmUrl, animationUrl, systemPrompt, visionSystemPrompt];

      // Adding late assigned keys and values to the lists
      keysList = [...keysList, ...lateAssignKeys];
      valuesList = [...valuesList, ...lateAssignValues];

      console.log(keysList);  
      console.log(valuesList); 

      writeContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'mint',
        args: ["Amica NFT", "AINFT", keysList, valuesList],
      });

      setAgentId(aid?.toString() || '');

    } catch (error) {
      console.error("Minting failed:", error);
      throw error; 
    } finally {
      setIsMinting(false);
    }
  }

  const router = useRouter();

  const handleCloseIcon = () => {
    router.push('/');
  };

  useEffect(() => {
    document.body.style.backgroundImage = `url(/liquid-metaballs.jpg)`;
    document.body.style.backgroundSize = `cover`;
    document.body.style.backgroundRepeat = `no-repeat`;
    document.body.style.backgroundPosition = `bottom right`;
  }, []);

  return (
    
    <div className="p-10 md:p-20">
      <style jsx global>
        {`
        body {
          background-image: url('/liquid-metaballs.jpg');
          background-size: cover;
          background-repeat: no-repeat;
          background-position: bottom right;
        }
      `}
      </style>
      <div className="fixed top-0 left-0 w-full max-h-full text-black text-xs text-left z-20">
        <div className="p-2 bg-white flex justify-between items-center">
            <IconButton
              iconName="24/Close"
              isProcessing={false}
              className="bg-secondary hover:bg-secondary-hover active:bg-secondary-active"
              onClick={handleCloseIcon}/>
            <ConnectButton/>
        </div>
      </div>

      <div className="col-span-3 max-w-md rounded-xl mt-4">
        <RadioBox
          options={[
            { label: "Minting", value: "Minting" },
            { label: "Sharing", value: "Sharing" },
          ]}
          selectedValue={characterCreatorType}
          onChange={setCharacterCreatorType}
          disabled={!!sqid || !!agentId}
        />
      </div>
      
      <div className="col-span-3 max-w-md rounded-xl mt-4">
        <h1 className="text-lg">{t(`Character Creator for ${characterCreatorType}`)}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>

          <div className="sm:col-span-3 max-w-md rounded-xl mt-4">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              {t("Name")}
            </label>
            <div className="mt-2">
              <input
                type="text"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                value={name}
                readOnly={!!sqid || !!agentId}
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
            </div>
          </div>

          <div className="sm:col-span-3 max-w-md rounded-xl mt-4">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              {t("Description")}
            </label>
            <div className="mt-2">
              <textarea
                rows={4}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                value={description}
                readOnly={!!sqid || !!agentId}
                placeholder={t("Provide a description of the character")}
                onChange={(e) => {
                  setDescription(e.target.value);
                }}
              />
            </div>
          </div>

          <div className="sm:col-span-3 max-w-md rounded-xl mt-4">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              {t("System Prompt")}
            </label>
            <div className="mt-2">
              <textarea
                rows={4}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                value={systemPrompt}
                readOnly={!!sqid || !!agentId}
                onChange={(e) => {
                  setSystemPrompt(e.target.value);
                }}
              />
            </div>
          </div>

          <div className="sm:col-span-3 max-w-md rounded-xl mt-4">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              {t("Vision System Prompt")}
            </label>
            <div className="mt-2">
              <textarea
                rows={4}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                value={visionSystemPrompt}
                readOnly={!!sqid || !!agentId}
                onChange={(e) => {
                  setVisionSystemPrompt(e.target.value);
                }}
              />
            </div>
          </div>

          <div className="sm:col-span-3 max-w-md rounded-xl mt-4">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              {t("Background URL")}
            </label>
            <div className="mt-2">
              <input
                type="text"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                value={bgUrl}
                readOnly={!!sqid || !!agentId}
                onChange={(e) => {
                  setBgUrl(e.target.value);
                }}
              />
              <FilePond
                files={bgFiles}
                // this is done to remove type error
                // filepond is not typed properly
                onupdatefiles={(files: any) => {
                  setBgFiles(files);
                }}
                server={`${process.env.NEXT_PUBLIC_AMICA_API_URL}/api/upload?type=bgimg`}
                name="file"
                labelIdle='.png & .jpg files only<br />click or drag & drop'
                acceptedFileTypes={['image/png', 'image/jpeg']}
                onremovefile={(err, file) => {
                  if (err) {
                    console.error(err);
                    return;
                  }

                  setBgUrl('');
                }}
                onprocessfile={(err, file) => {
                  if (err) {
                    console.error(err);
                    return;
                  }

                  async function handleFile(file: File) {
                    const hashValue = await hashFile(file);
                    setBgUrl(`${process.env.NEXT_PUBLIC_AMICA_STORAGE_URL}/${hashValue}`);
                  }

                  handleFile(file.file as File);
                }}
                disabled={!!sqid}
              />
            </div>
          </div>

          { characterCreatorType === "Minting" && (
            <div className="sm:col-span-3 max-w-md rounded-xl mt-4">
              <label className="block text-sm font-medium leading-6 text-gray-900">
                {t("Thumbnail URL")}
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  value={thumbUrl}
                  readOnly={!!sqid || !!agentId}
                  onChange={(e) => {
                    setBgUrl(e.target.value);
                  }}
                />
                <FilePond
                  files={thumbFiles}
                  // this is done to remove type error
                  // filepond is not typed properly
                  onupdatefiles={(files: any) => {
                    setThumbFiles(files);
                  }}
                  server={`${process.env.NEXT_PUBLIC_AMICA_API_URL}/api/upload?type=bgimg`}
                  name="file"
                  labelIdle='.png & .jpg files only<br />click or drag & drop'
                  acceptedFileTypes={['image/png', 'image/jpeg']}
                  onremovefile={(err, file) => {
                    if (err) {
                      console.error(err);
                      return;
                    }

                    setThumbUrl('');
                  }}
                  onprocessfile={(err, file) => {
                    if (err) {
                      console.error(err);
                      return;
                    }

                    async function handleFile(file: File) {
                      const hashValue = await hashFile(file);
                      setThumbUrl(`${process.env.NEXT_PUBLIC_AMICA_STORAGE_URL}/${hashValue}`);
                    }

                    handleFile(file.file as File);
                  }}
                  disabled={!!sqid || !!agentId}
                />
              </div>
            </div>
          )}
          

          <div className="sm:col-span-3 max-w-md rounded-xl mt-4">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              {t("YouTube Video ID")}
            </label>
            <div className="mt-2">
              <p className="text-xs text-slate-500">{t("Example")}: https://www.youtube.com/watch?v=<span className="text-red-500">dQw4w9WgXcQ</span></p>
              <input
                type="text"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                value={youtubeVideoId}
                readOnly={!!sqid || !!agentId}
                onChange={(e) => {
                  setYoutubeVideoId(e.target.value);
                }}
              />
              {youtubeVideoId && (
                <img width="100%" src={`https://img.youtube.com/vi/${youtubeVideoId}/0.jpg`} />
              )}
            </div>
          </div>

          {showUploadLocalVrmMessage && (
            <div className="sm:col-span-3 max-w-md rounded-xl mt-4">
              <label className="block text-sm font-medium leading-6 text-gray-900">
                {t("Upload VRM")}
              </label>
              <div className="mt-2 text-sm leading-6 text-gray-900">
                <p>{t("VRM upload message")}</p>
                <p>{t("VRM local share message")}</p>
                <div className="sm:col-span-3 max-w-md rounded-xl mt-2">
                  <button
                    onClick={uploadVrmFromIndexedDb}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-fuchsia-500 hover:bg-fuchsia-600 focus:outline-none disabled:opacity-50 disabled:hover:bg-fuchsia-500 disabled:cursor-not-allowed"
                  >
                    {t("Upload Vrm")}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className={"sm:col-span-3 max-w-md rounded-xl mt-4" + (!showUploadLocalVrmMessage ? "" : " hidden")}>
            <label className="block text-sm font-medium leading-6 text-gray-900">
              {t("VRM Url")}
            </label>
            <div className="mt-2">
              <p className="text-xs text-slate-500"></p>
              <input
                type="text"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                value={vrmUrl}
                readOnly={!!sqid || !!agentId}
                onChange={(e) => {
                  setVrmUrl(e.target.value);
                  updateVrmAvatar(viewer, e.target.value);
                  setVrmLoaded(false);
                }}
              />
              <FilePond
                ref={vrmUploadFilePond}
                files={vrmFiles}
                // this is done to remove type error
                // filepond is not typed properly
                onupdatefiles={(files: any) => {
                  setVrmFiles(files);
                }}
                server={`${process.env.NEXT_PUBLIC_AMICA_API_URL}/api/upload?type=vrm`}
                name="file"
                labelIdle='.vrm files only<br />click or drag & drop'
                acceptedFileTypes={['model/gltf-binary']}
                fileValidateTypeDetectType={vrmDetector}
                onaddfilestart={(file) => {
                  setVrmUrl('');
                  setVrmLoaded(false);
                }}
                onremovefile={(err, file) => {
                  if (err) {
                    console.error(err);
                    return;
                  }

                  setVrmUrl('');
                  setVrmLoaded(false);
                }}
                onprocessfile={(err, file) => {
                  if (err) {
                    console.error(err);
                    return;
                  }

                  async function handleFile(file: File) {
                    const hashValue = await hashFile(file);
                    const url = `${process.env.NEXT_PUBLIC_AMICA_STORAGE_URL}/${hashValue}`;
                    setVrmUrl(url);
                    updateVrmAvatar(viewer, url);
                    if (vrmSaveType == 'local') {
                      setVrmLoadingFromIndexedDb(false);
                      setVrmLoadedFromIndexedDb(true);
                    }
                    setVrmLoaded(false);
                  }

                  handleFile(file.file as File);
                }}
                disabled={!!sqid}
              />

              <div className="sm:col-span-3 max-w-md rounded-xl mt-4 bg-gray-100">
                  {vrmUrl && (
                    <VrmDemo
                      vrmUrl={vrmUrl}
                      onLoaded={() => {
                        setVrmLoaded(true);
                        (async () => {
                          try {
                            const animation = await loadVRMAnimation("/animations/idle_loop.vrma");
                            if (!animation) {
                              console.error('loading animation failed');
                              return;
                            }
                            viewer.model!.loadAnimation(animation!);
                            requestAnimationFrame(() => {
                              viewer.resetCamera()
                            });
                          } catch (e) {
                            console.error('loading animation failed', e);
                          }
                        })();
                        console.log('vrm demo loaded');
                      }}
                      onScreenShot={
                        async (blob: Blob | null) => {
                          if (blob)
                            return setThumbData(blobToFile(blob!, "thumb.jpg")); 
                      }}
                    />
                  )}
              </div>
            </div>
          </div>

          {/*
          <div className="sm:col-span-3 max-w-md rounded-xl mt-4">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Animation Url
            </label>
            <div className="mt-2">
              <input
                type="text"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                value={animationUrl}
                readOnly={!! sqid}
                onChange={(e) => {
                  setAnimationUrl(e.target.value);
                }}
              />
              <FilePond
                files={animationFiles}
                // this is done to remove type error
                // filepond is not typed properly
                onupdatefiles={(files: any) => {
                  setAnimationFiles(files);
                }}
                // TODO read this url from env
                server={`${process.env.NEXT_PUBLIC_AMICA_API_URL}/api/upload?type=anim`}
                name="file"
                labelIdle='.vrm files only<br />click or drag & drop'
                acceptedFileTypes={['model/gltf-binary']}
                fileValidateTypeDetectType={vrmDetector}
                onremovefile={(err, file) => {
                  if (err) {
                    console.error(err);
                    return;
                  }

                  setAnimationUrl('');
                }}
                onprocessfile={(err, file) => {
                  if (err) {
                    console.error(err);
                    return;
                  }

                  async function handleFile(file: File) {
                    const hashValue = await hashFile(file);
                    setAnimationUrl(`${process.env.NEXT_PUBLIC_AMICA_STORAGE_URL}/${hashValue}`);
                  }

                  handleFile(file.file as File);
                }}
                disabled={!! sqid}
              />
            </div>
          </div>
          */}

          <div className="sm:col-span-3 max-w-md rounded-xl mt-4">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Voice Url
            </label>
            <div className="mt-2">
              <input
                type="text"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                value={voiceUrl}
                readOnly={!!sqid || !!agentId}
                onChange={(e) => {
                  setVoiceUrl(e.target.value);
                }}
              />
              <FilePond
                files={voiceFiles}
                // this is done to remove type error
                // filepond is not typed properly
                onupdatefiles={(files: any) => {
                  setVoiceFiles(files);
                }}
                server={`${process.env.NEXT_PUBLIC_AMICA_API_URL}/api/upload?type=voice`}
                name="file"
                labelIdle='.wav & .mp3 files only<br />click or drag & drop'
                acceptedFileTypes={['audio/wav', 'audio/mpeg']}
                onremovefile={(err, file) => {
                  if (err) {
                    console.error(err);
                    return;
                  }

                  setVoiceUrl('');
                }}
                onprocessfile={(err, file) => {
                  if (err) {
                    console.error(err);
                    return;
                  }

                  async function handleFile(file: File) {
                    const hashValue = await hashFile(file);
                    setVoiceUrl(`${process.env.NEXT_PUBLIC_AMICA_STORAGE_URL}/${hashValue}`);
                  }

                  handleFile(file.file as File);
                }}
                disabled={!!sqid || !!agentId}
              />
            </div>
          </div>

          {/* Configs Button */}
          <button
            type="button"
            onClick={handleConfigToggle}
            className="mt-4 text-sm text-indigo-600 hover:text-indigo-800"
          >
            {showConfigs ? 'Hide Configs' : 'Show Configs'}
          </button>
          
          {showConfigs && characterCreatorType === "Minting" && (
            <div className="m:col-span-3 max-w-md mt-4">
              {Object.keys(filteredDefault).map((key) => {
                return Object.keys(filteredDefault).length > 0 ? (
                  <div key={key}>
                    {/* Gray line separate from the container */}
                    <div className="border-t border-gray-300 mb-4 mt-4"></div>

                    <div className="max-w-md rounded-xl mt-4">
                      {/* Top Key label */}
                      <label className="block text-sm font-medium leading-6 text-gray-900">
                        {key} {/* Top key as the head label */}
                      </label>
                      <div className="mt-2">
                          <input
                            type="text"
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            value={filteredDefault[key]}
                            readOnly={true}
                          />
                      </div>
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          )}

          {!sqid && characterCreatorType === "Sharing" && (
            <div className="sm:col-span-3 max-w-md rounded-xl mt-8">
              <button
                onClick={registerCharacter}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-fuchsia-500 hover:bg-fuchsia-600 focus:outline-none disabled:opacity-50 disabled:hover:bg-fuchsia-500 disabled:cursor-not-allowed"
                disabled={!vrmLoaded || showUploadLocalVrmMessage || vrmLoadingFromIndexedDb || isRegistering}
              >
                {t("Save Character")}
              </button>
            </div>
          )}

          {!agentId && characterCreatorType === "Minting" && (
            <div className="sm:col-span-3 max-w-md rounded-xl mt-8">
              <button
                onClick={mintCharacter}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-fuchsia-500 hover:bg-fuchsia-600 focus:outline-none disabled:opacity-50 disabled:hover:bg-fuchsia-500 disabled:cursor-not-allowed"
                disabled={!vrmLoaded || showUploadLocalVrmMessage || vrmLoadingFromIndexedDb || isMinting || !isConnected}
              >
                {isPending ? t('Confirming...') : t("Mint Agent")}
              </button>
            </div>
          )}

          {sqid && (
            <div className="sm:col-span-3 max-w-md rounded-xl mt-8">
              <p className="text-sm">{t("Share this code (click to copy):")}</p>
              <input
                type="text"
                className="inline-flex items-center px-2 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-fuchsia-600 bg-fuchsia-100 hover:bg-fuchsia-200 focus:outline-transparent focus:border-transparent border-transparent disabled:opacity-50 disabled:hover:bg-fuchsia-50 disabled:cursor-not-allowed hover:cursor-copy"
                defaultValue={sqid}
                readOnly
                onClick={(e) => {
                  // @ts-ignore
                  navigator.clipboard.writeText(e.target.value);
                }}
              />
              <p className="mt-6 text-sm">
                {t("Or, you can share this direct link:")}
                {' '}
                <Link
                  href={`https://amica.arbius.ai/import/${sqid}`}
                  target={isTauri() ? "_blank" : ''}
                  className="text-cyan-600 hover:text-cyan-700"
                >
                  https://amica.arbius.ai/import/{sqid}
                </Link>
              </p>

              <Link href="/">
                <button
                  className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none disabled:opacity-50 disabled:hover:bg-emerald-500 disabled:cursor-not-allowed"
                >
                  {t("Return Home")}
                </button>
              </Link>
            </div>
          )}

          {isConfirmed && agentId && (
            <div className="sm:col-span-3 max-w-md rounded-xl mt-8">
              <p className="text-sm">{t("Minting succesfully with agentid:")}</p>
              <input
                type="text"
                className="inline-flex items-center px-2 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-fuchsia-600 bg-fuchsia-100 hover:bg-fuchsia-200 focus:outline-transparent focus:border-transparent border-transparent disabled:opacity-50 disabled:hover:bg-fuchsia-50 disabled:cursor-not-allowed hover:cursor-copy"
                defaultValue={agentId}
                readOnly
              />

              <Link href="/">
                <button
                  className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none disabled:opacity-50 disabled:hover:bg-emerald-500 disabled:cursor-not-allowed"
                >
                  {t("Return Home")}
                </button>
              </Link>
            </div>
          )}
        </div>
        <div>
          {/* empty column */}
        </div>
      </div>
    </div>
  );
}

