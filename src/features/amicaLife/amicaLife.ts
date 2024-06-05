import { Queue } from "typescript-collections";
import { Chat } from "@/features/chat/chat";
import { config } from "@/utils/config";

const idleEvents = [
  "I am ignoring you!",
  "Tell me a joke!",
  "Speak to me about a topic you are interested in.",
] as const;

export type IdleEvents = (typeof idleEvents)[number];

type AmicaLifeEvents = {
  events: IdleEvents;
};

export class AmicaLife {
  public mainEvents: Queue<AmicaLifeEvents>;
  private isIdleLoopRunning: boolean;
  private isFirstCall: boolean;
  public chat: Chat | null;

  constructor(chat: Chat) {
    this.mainEvents = new Queue<AmicaLifeEvents>();
    this.isIdleLoopRunning = false;
    this.isFirstCall = true;
    this.chat = chat;
    this.initializeDefaultEvents();
  }

  private initializeDefaultEvents() {
    idleEvents.forEach((event) => {
      this.mainEvents.enqueue({ events: event });
    });
  }

  public async startIdleLoop() {
    if (this.isIdleLoopRunning) {
      return;
    }

    if (this.isFirstCall) {
      this.isFirstCall = false;
      return;
    }

    this.isIdleLoopRunning = true;
    console.log("Starting idle loop");

    const processIdleEvents = async () => {
      while (this.isIdleLoopRunning) {
        // Random chance for doing nothing (25% chance)
        if (Math.random() <= 0.25) {
          console.log("Doing nothing this cycle");
          await this.wait();
          continue;
        }

        const idleEvent = this.mainEvents.dequeue();
        if (idleEvent) {
          await this.handleIdleEvent(idleEvent);
          this.mainEvents.enqueue(idleEvent);
        } else {
          console.log("No idle events in queue");
        }
        // Wait for an interval time before processing the next event
        await this.wait();
      }
    };

    processIdleEvents().catch((e) => {
      console.error("Idle loop encountered an error:", e);
      this.isIdleLoopRunning = false;
    });
  }

  public stopIdleLoop() {
    this.isIdleLoopRunning = false;
  }

  public async handleIdleEvent(event: AmicaLifeEvents) {
    console.log("Handling idle event:", event.events);
    try {
      await this.chat?.receiveMessageFromUser?.(event.events, true);
    } catch (error) {
      console.error(
        "Error occurred while trying to use the chat instance:",
        error,
      );
    }
  }

  public async wait() {
    const [minMs, maxMs] = [
      parseInt(config("min_time_interval_sec")),
      parseInt(config("max_time_interval_sec")),
    ];
    const interval =
      Math.floor(Math.random() * (maxMs - minMs + 1) + minMs) * 1000;
    return new Promise((resolve) => setTimeout(resolve, interval));
  }
}
