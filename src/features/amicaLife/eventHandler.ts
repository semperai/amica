import { basename } from "@/components/settings/common";
import { animationList } from "@/paths";
import { loadVRMAnimation } from "@/lib/VRMAnimation/loadVRMAnimation";
import { Chat } from "@/features/chat/chat";

export const idleEvents = [
  "I am ignoring you!",
  "Say something funny!",
  "Speak to me about a topic you are interested in.",
  "VRMA",
] as const;

export type IdleEvents = (typeof idleEvents)[number];

export type AmicaLifeEvents = {
  events: IdleEvents;
};

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
    default:
      await handleTextEvent(event.events, chat);
      break;
  }
}
