import { animationList } from "@/paths";
import { loadVRMAnimation } from "@/lib/VRMAnimation/loadVRMAnimation";

import { Chat } from "@/features/chat/chat";
import { emotions } from "@/features/chat/messages";

import { basename } from "@/components/settings/common";
import { askLLM } from "@/utils/askLlm";

import { AmicaLife } from "./amicaLife";
import { Viewer } from "../vrmViewer/viewer";

export const idleEvents = [
  "VRMA",
  "Subconcious",
  "IdleTextPrompts",
] as const;

export const basedPrompt = {
  idleTextPrompt: [
    "*I am ignoring you*",
    "**sighs** It's so quiet here.",
    "Tell me something interesting about yourself.",
    "**looks around** What do you usually do for fun?",
    "I could use a good distraction right now.",
    "What's the most fascinating thing you know?",
    "**smiles** Any witty remarks up your sleeve?",
    "If you could talk about anything, what would it be?",
    "Got any clever insights to share?",
    "**leans in** Any fun stories to tell?",
  ],
};

export type AmicaLifeEvents = {
  events: string;
};

// Define a constant for max subconcious storage tokens
const MAX_STORAGE_TOKENS = 3000;

// Define the interface for a timestamped prompt
interface TimestampedPrompt {
  prompt: string;
  timestamp: string;
}

// Placeholder for storing compressed subconscious prompts
export let storedPrompts: TimestampedPrompt[] = [];

// Handles the VRM animation event.

async function handleVRMAnimationEvent(viewer: Viewer, amicaLife: AmicaLife) {
  // Select a random animation from the list
  const randomAnimation =
  animationList[Math.floor(Math.random() * animationList.length)];
  console.log("Handling idle event (animation):", basename(randomAnimation));

  // Boolean to check if the animation should reinitialized its initial position to sync with idle action or not
  const modify =
    basename(randomAnimation) === "greeting.vrma" ||
    basename(randomAnimation) === "idle_loop.vrma"
      ? false
      : true;

  try {
    if (viewer) {
      const animation = await loadVRMAnimation(randomAnimation);
      if (!animation) {
        throw new Error("Loading animation failed");
      }
      // @ts-ignore
      const duration = await viewer.model!.playAnimation(animation, modify);
      requestAnimationFrame(() => { viewer.resetCameraLerp(); });

      // Set timeout for the duration of the animation
      setTimeout(() => {
        amicaLife.eventProcessing = false;
        console.timeEnd("processing_event VRMA");
      }, duration * 1000);
    }
  } catch (error) {
    console.error("Error loading animation:", error);
  }
}

// Handles text-based idle events.

async function handleTextEvent(chat: Chat, amicaLife: AmicaLife) {
  // Randomly select the idle text prompts
  const randomIndex = Math.floor(
    Math.random() * basedPrompt.idleTextPrompt.length,
  );
  const randomTextPrompt = basedPrompt.idleTextPrompt[randomIndex];

  console.log("Handling idle event (text):", randomTextPrompt);
  try {
    await chat.receiveMessageFromUser?.(randomTextPrompt, true);
    amicaLife.eventProcessing = false;
    console.timeEnd(`processing_event IdleTextPrompts`);
  } catch (error) {
    console.error(
      "Error occurred while sending a message through chat instance:",
      error,
    );
  }
}

// Handles sleep event.

export async function handleSleepEvent(chat: Chat, amicaLife: AmicaLife) {
  console.log("Handling idle event :", "Sleep");
  amicaLife.pause();
  amicaLife.isSleep = true;
  try {
    const viewer = chat.viewer;
    if (viewer) {
      // @ts-ignore
      await viewer.model!.playEmotion("Sleep");
    }
    amicaLife.eventProcessing = false;
    console.timeEnd("processing_event Sleep");
  } catch (error) {
    console.error("Error playing emotion sleep:", error);
  }
}

// Handles subconcious event.

export async function handleSubconsciousEvent(
  chat: Chat,
  amicaLife: AmicaLife,
) {
  console.log("Handling idle event:", "Subconscious");

  const convo = chat.messageList;
  const convoLog = convo
    .map((message) => {
      return `${message.role === "user" ? "User" : "Assistant"}: ${
        message.content
      }`;
    })
    .join("\n");

  try {
    // Step 1: Simulate subconscious self mental diary
    const subconciousWordSalad = await askLLM(
      "Please reflect on the conversation and let your thoughts flow freely, as if writing a personal diary with events that have occurred:",
      `${convoLog}`,
      null,
    );
    console.log("Result from step 1: ", subconciousWordSalad);

    // Step 2: Describe the emotion you feel about the subconscious diary
    const secondStepPrompt = subconciousWordSalad.startsWith("Error:")
      ? convoLog
      : subconciousWordSalad;
    const decipherEmotion = await askLLM(
      "Read this mini-diary, I would like you to simulate a human-like subconscious with deep emotions and describe it from a third-person perspective:",
      secondStepPrompt,
      null,
    );
    console.log("Result from step 2: ", decipherEmotion);

    // Step 3: Decide on one of the emotion tags best suited for the described emotion
    const thirdStepPrompt = decipherEmotion.startsWith("Error:")
      ? convoLog
      : decipherEmotion;
    const emotionDecided = await askLLM(
      `Based on your mini-diary, respond with dialougue that sounds like a normal person speaking about their mind, experience or feelings. Make sure to incorporate the specified emotion tags in your response. Here is the list of emotion tags that you have to include in the result : ${emotions
        .map((emotion) => `[${emotion}]`)
        .join(", ")}:`,
      thirdStepPrompt,
      chat,
    );
    console.log("Result from step 3: ", emotionDecided);

    // Step 4: Compress the subconscious diary entry to 240 characters
    const fourthStepPrompt = subconciousWordSalad.startsWith("Error:")
      ? convoLog
      : subconciousWordSalad;
    const compressSubconcious = await askLLM(
      "Compress this prompt to 240 characters:",
      fourthStepPrompt,
      null,
    );
    console.log("Result from step 4: ", compressSubconcious);

    // Add timestamp to the compressed subconscious
    const timestampedPrompt: TimestampedPrompt = {
      prompt: compressSubconcious,
      timestamp: new Date().toISOString(),
    };

    storedPrompts.push(timestampedPrompt);
    let totalStorageTokens = storedPrompts.reduce(
      (totalTokens, prompt) => totalTokens + prompt.prompt.length,
      0,
    );
    while (totalStorageTokens > MAX_STORAGE_TOKENS) {
      const removed = storedPrompts.shift();
      totalStorageTokens -= removed!.prompt.length;
    }
    console.log("Stored subconcious prompts:", storedPrompts);

    amicaLife.eventProcessing = false;
    console.timeEnd(`processing_event Subconcious`);
  } catch (error) {
    console.error("Error handling subconscious event:", error);
  }
}

// Main handler for idle events.

export async function handleIdleEvent(
  event: AmicaLifeEvents,
  amicaLife: AmicaLife,
  chat: Chat,
  viewer: Viewer,
) {
  if (!chat) {
    console.error("Chat instance is not available");
    return;
  }

  switch (event.events) {
    case "VRMA":
      await handleVRMAnimationEvent(viewer, amicaLife);
      break;
    case "Subconcious":
      await handleSubconsciousEvent(chat, amicaLife);
      break;
    case "Sleep":
      await handleSleepEvent(chat, amicaLife);
      break;
    default:
      await handleTextEvent(chat, amicaLife);
      break;
  }
}
