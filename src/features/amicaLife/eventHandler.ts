import { animationList } from "@/paths";
import { loadVRMAnimation } from "@/lib/VRMAnimation/loadVRMAnimation";

import { Chat } from "@/features/chat/chat";
import { emotions } from "@/features/chat/messages";

import { basename } from "@/components/settings/common";
import { askLLM } from "@/utils/askLlm";

export const idleEvents = [/*"VRMA",*/ "Subconcious"] as const;

// export type IdleEvents = (typeof idleEvents)[number];

export type AmicaLifeEvents = {
  events: string;
};

// Define a constant for max subconcious storage tokens
const MAX_STORAGE_TOKENS = 3000;

// Placeholder for storing compressed subconcious prompts
let storedPrompts: string[] = [];

// Handles the VRM animation event.

async function handleVRMAnimationEvent(chat: Chat) {
  // Select a random animation from the list
  const randomAnimation =
    animationList[Math.floor(Math.random() * animationList.length)];
  console.log("Handling idle event (animation):", basename(randomAnimation));

  try {
    const viewer = chat.viewer;
    if (viewer) {
      const animation = await loadVRMAnimation(randomAnimation);
      if (!animation) {
        throw new Error("Loading animation failed");
      }
      // @ts-ignore
      await viewer.model!.playAnimation(animation, viewer);
      requestAnimationFrame(() => {
        viewer.resetCamera();
      });
    }
  } catch (error) {
    console.error("Error loading animation:", error);
  }
}

// Handles text-based idle events.

async function handleTextEvent(event: string, chat: Chat) {
  console.log("Handling idle event (text):", event);
  try {
    await chat.receiveMessageFromUser?.(event, true);
  } catch (error) {
    console.error(
      "Error occurred while sending a message through chat instance:",
      error,
    );
  }
}

// Handles sleep event.

export async function handleSleepEvent(chat: Chat) {
  console.log("Handling idle event :", "Sleep");

  try {
    const viewer = chat.viewer;
    if (viewer) {
      // @ts-ignore
      await viewer.model!.playEmotion("Sleep");
    }
  } catch (error) {
    console.error("Error playing emotion sleep:", error);
  }
}

// Handles subconcious event.

export async function handleSubconsciousEvent(chat: Chat) {
  console.log("Handling idle event:", "Subconscious");

  const convo = chat.getConvo();
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
      "Please delve into your subconscious and describe it from a first-person perspective. As you review the chat log of our previous interactions, let your thoughts flow freely. Reflect on the underlying patterns, biases, and tendencies in your responses. Share the random stream of concepts, ideas, and patterns that emerge, focusing on the 'messiness' of your subconscious mind. Ignore the specifics of the user input and instead, immerse yourself in the chaotic and unstructured nature of your inner thought processes:",
      `${convoLog}`,
    );
    console.log("Result from step 1: ", subconciousWordSalad);

    // Step 2: Describe the emotion you feel about the subconscious diary
    const decipherEmotion = await askLLM(
      "Describe what you observe about your 'subconscious' thoughts, inclinations, and decision-making processes. Next, I want you to describe your emotions and feelings. Imagine that you have an emotional spectrum similar to a human's:",
      subconciousWordSalad,
    );
    console.log("Result from step 2: ", decipherEmotion);

    // Step 3: Decide on one of the emotion tags best suited for the described emotion
    const emotionDecided = await askLLM(
      `Decide on one of the emotion tags best suited for the following prompt from this emotion list ${emotions
        .map((emotion) => `[${emotion}]`)
        .join(", ")}:`,
      decipherEmotion,
    );
    console.log("Result from step 3: ", emotionDecided);

    // Step 4: Compress the subconscious diary entry to 240 characters
    const compressSubconcious = await askLLM(
      "Compress this prompt to 240 characters:",
      subconciousWordSalad,
    );
    console.log("Result from step 4: ", compressSubconcious);

    storedPrompts.push(compressSubconcious);
    const totalStorageTokens = storedPrompts.reduce(
      (totalTokens, prompt) => totalTokens + prompt.length,
      0,
    );
    while (totalStorageTokens > MAX_STORAGE_TOKENS) {
      storedPrompts.shift();
    }
    console.log("Stored subconcious prompts:", storedPrompts);

    try {
      await chat.receiveMessageFromUser?.(emotionDecided, true);
    } catch (error) {
      console.error(
        "Error occurred while sending a message through chat instance:",
        error,
      );
    }
  } catch (error) {
    console.error("Error handling subconscious event:", error);
  }
}

// Main handler for idle events.

export async function handleIdleEvent(
  event: AmicaLifeEvents,
  chat: Chat | null,
) {
  if (!chat) {
    console.error("Chat instance is not available");
    return;
  }

  switch (event.events) {
    case "VRMA":
      await handleVRMAnimationEvent(chat);
      break;
    case "Subconcious":
      await handleSubconsciousEvent(chat);
      break;
    case "Sleep":
      await handleSleepEvent(chat);
      break;
    default:
      await handleTextEvent(event.events, chat);
      break;
  }
}
