import { basename } from "@/components/settings/common";
import { animationList } from "@/paths";
import { loadVRMAnimation } from "@/lib/VRMAnimation/loadVRMAnimation";
import { Chat } from "@/features/chat/chat";
import { Message } from "@/features/chat/messages";
import { emotions } from "@/features/chat/messages";

export const idleEvents = [
  "VRMA",
  "Subconcious",
] as const;

export type IdleEvents = (typeof idleEvents)[number];

export type AmicaLifeEvents = {
  events: IdleEvents;
};

// Define a constant for max subconcious storage tokens
const MAX_STORAGE_TOKENS = 3000;

// Placeholder for storing compressed subconcious prompts
let storedPrompts: string[] = [];

// Handles the VRM animation event.

async function handleVRMAnimationEvent(chat: Chat) {
  // Select a random animation from the list
  const randomAnimation = animationList[Math.floor(Math.random() * animationList.length)];
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
        viewer.resetCamera()
      });

    }
  } catch (error) {
    console.error("Error loading animation:", error);
  }
}


// Handles text-based idle events.
 
async function handleTextEvent(event: IdleEvents, chat: Chat) {
  console.log("Handling idle event (text):", event);
  try {
    await chat.receiveMessageFromUser?.(event, true);
  } catch (error) {
    console.error("Error occurred while sending a message through chat instance:", error);
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

  try {
    // Step 1: Simulate subconscious self mental diary
    const subconciousWordSalad = await chat.askLLM([
      { role: "system", content: "Simulate subconscious self mental diary: " },
      { role: "user", content: "[convo log]" }
    ]);

    // Step 2: Describe the emotion you feel about the subconscious diary
    const decipherEmotion = await chat.askLLM([
      { role: "system", content: "Describe the emotion you feel about: " },
      { role: "user", content: subconciousWordSalad }
    ]);

    // Step 3: Decide on one of the emotion tags best suited for the described emotion
    const emotionDecided = await chat.askLLM([
      { role: "system", content: `Decide on one of the emotion tags best suited for the following prompt from this emotion list ${emotions.map(emotion => `[${emotion}]`).join(", ")}:` },
      { role: "user", content: decipherEmotion }
    ]);

    try {
      await chat.receiveMessageFromUser?.(emotionDecided, true);
    } catch (error) {
      console.error("Error occurred while sending a message through chat instance:", error);
    }

    // Step 4: Compress the subconscious diary entry to 240 characters
    const compressSubconcious = await chat.askLLM([
      { role: "system", content: "Compress this prompt to 240 characters:" },
      { role: "user", content: subconciousWordSalad }
    ]);

    console.log("Subconscious process complete:", compressSubconcious);
    
    storedPrompts.push(compressSubconcious);
    const totalStorageTokens = storedPrompts.reduce((totalTokens, prompt) => totalTokens + prompt.length, 0);
    while (totalStorageTokens > MAX_STORAGE_TOKENS) {
      storedPrompts.shift(); 
    }
    console.log("Stored subconcious prompts:", storedPrompts);

  } catch (error) {
    console.error("Error handling subconscious event:", error);
  }
}


// Main handler for idle events.

export async function handleIdleEvent(event: AmicaLifeEvents, chat: Chat | null) {
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
    default:
      await handleTextEvent(event.events, chat);
      break;
  }
}