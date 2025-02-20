import { animationList } from "@/paths";
import { loadVRMAnimation } from "@/lib/VRMAnimation/loadVRMAnimation";

import { Chat } from "@/features/chat/chat";
import { emotions } from "@/features/chat/messages";

import { basename } from "@/components/settings/common";
import { askLLM } from "@/utils/askLlm";

import { functionCalling } from "@/features/functionCalling/functionCalling";
import { AmicaLife } from "./amicaLife";
import { Viewer } from "../vrmViewer/viewer";
import { config } from "@/utils/config";
import isDev from "@/utils/isDev";
import { handleSubconscious } from "../externalAPI/externalAPI";

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
    "If you could talk about anything, what would it be?",
    "Got any clever insights to share?",
    "**leans in** Any fun stories to tell?",
  ],
};

export type AmicaLifeEvents = {
  events: string;
};

// Define a constant for max subconcious storage tokens
export const MAX_STORAGE_TOKENS = 3000;

// Define the interface for a timestamped prompt
export type TimestampedPrompt = {
  prompt: string;
  timestamp: string;
}

// Placeholder for storing compressed subconscious prompts
export let storedSubconcious: TimestampedPrompt[] = [];

let previousAnimation = "";

// Handles the VRM animation event.

async function handleVRMAnimationEvent(viewer: Viewer, amicaLife: AmicaLife) {
  let randomAnimation;
  do {
    randomAnimation = animationList[Math.floor(Math.random() * animationList.length)];
  } while (basename(randomAnimation) === previousAnimation);

  // Store the current animation as the previous one for the next call
  previousAnimation = basename(randomAnimation);
  // removed for staging logs.
  //console.log("Handling idle event (animation):", previousAnimation);

  try {
    if (viewer) {
      const animation = await loadVRMAnimation(randomAnimation);
      if (!animation) {
        throw new Error("Loading animation failed");
      }
      // @ts-ignore
      const duration = await viewer.model!.playAnimation(animation, previousAnimation);
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
  // removed for staging logs.
  //console.log("Handling idle event (text):", randomTextPrompt);
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
  console.log("Sleeping...");
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
  // removed for staging logs.
  //console.log("Handling idle event:", "Subconscious");

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
    // Removed for staging logs.
    //console.log("Result from step 1: ", subconciousWordSalad);

    // Step 2: Describe the emotion you feel about the subconscious diary
    const secondStepPrompt = subconciousWordSalad.startsWith("Error:")
      ? convoLog
      : subconciousWordSalad;
    const decipherEmotion = await askLLM(
      "Read this mini-diary, I would like you to simulate a human-like subconscious with deep emotions and describe it from a third-person perspective:",
      secondStepPrompt,
      null,
    );

    // Removed for staging logs.
    //console.log("Result from step 2: ", decipherEmotion);

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

    // Removed for staging logs.
    // console.log("Result from step 3: ", emotionDecided);

    // Step 4: Compress the subconscious diary entry to 240 characters
    const fourthStepPrompt = subconciousWordSalad.startsWith("Error:")
      ? convoLog
      : subconciousWordSalad;
    const compressSubconcious = await askLLM(
      "Compress this prompt to 240 characters:",
      fourthStepPrompt,
      null,
    );
    console.log("Stored Memory: ", compressSubconcious);

    // Add timestamp to the compressed subconscious
    const timestampedPrompt: TimestampedPrompt = {
      prompt: compressSubconcious,
      timestamp: new Date().toISOString(),
    };

    // External API feature
    if (isDev && config("external_api_enabled") === "true") {
      try {
        storedSubconcious = await handleSubconscious(timestampedPrompt);
      } catch (error) {
        console.error("Error handling external API:", error);
      }
    // External API Off or Isn't development case
    } else { 
      storedSubconcious.push(timestampedPrompt);
      let totalStorageTokens = storedSubconcious.reduce(
        (totalTokens, prompt) => totalTokens + prompt.prompt.length,
        0,
      );
      while (totalStorageTokens > MAX_STORAGE_TOKENS) {
        const removed = storedSubconcious.shift();
        totalStorageTokens -= removed!.prompt.length;
      }
    }
    
    console.log("Stored subconcious prompts:", storedSubconcious);
    amicaLife.setSubconciousLogs!(storedSubconcious);

    amicaLife.eventProcessing = false;
    console.timeEnd(`processing_event Subconcious`);
  } catch (error) {
    console.error("Error handling subconscious event:", error);
  }
}

// Handles news event

export async function handleNewsEvent(chat: Chat, amicaLife: AmicaLife) {
  console.log("Function Calling: News");

  try {
    const news = await functionCalling("news");
    if (!news) {
      throw new Error("Loading news failed");
    }
    await chat.receiveMessageFromUser?.(news, true);
    amicaLife.eventProcessing = false;
    console.timeEnd("processing_event News");
  } catch (error) {
    console.error(
      "Error occurred while sending a message through chat instance:",
      error,
    );
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
    case "News":
      await handleNewsEvent(chat, amicaLife);
      break;
    case "Sleep":
      await handleSleepEvent(chat, amicaLife);
      break;
    default:
      await handleTextEvent(chat, amicaLife);
      break;
  }
}