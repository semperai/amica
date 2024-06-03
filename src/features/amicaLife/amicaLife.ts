import { Queue } from 'typescript-collections';
import { Message } from "@/features/chat/messages";
import { Chat } from "@/features/chat/chat";


const intervalRange: [number, number] = [ 5 , 7 ];

const idleEvents = ["idleText"/*,"fnCalling"*/] as const;

const idleMessages = [ "I am ignoring you!", "tell me a joke!", "Speak to me about a topic you are interested in.", "I just poked you!" ] as const;

export type IdleEvents = (typeof idleEvents)[number];

type AmicaLifeEvents = {
    events: IdleEvents;
    messages: Message;
}

export class AmicaLife {
   
    public mainEvents: Queue<AmicaLifeEvents>;
    private isIdleLoopRunning: boolean;
    private chat: Chat | null;

    constructor(chat: Chat) {
        this.mainEvents = new Queue<AmicaLifeEvents>();
        this.isIdleLoopRunning = false;
        this.chat = chat;
        this.initializeDefaultEvents(); 
    }

    private initializeDefaultEvents() {
        const defaultEvents: AmicaLifeEvents[] = idleMessages.map(message => ({
            events: "idleText" as IdleEvents,
            messages: {
                role: 'assistant',
                content: message 
            }
        }));
        defaultEvents.forEach(event => this.mainEvents.enqueue(event));
    }

    public isIdleLoopRunningStatus() {
        return this.isIdleLoopRunning;
    }

    public async startIdleLoop() {
        if (this.isIdleLoopRunning) {
            return; 
        }

        this.isIdleLoopRunning = true;
        console.log("Starting idle loop");

        const processIdleEvents = async () => {
            while (this.isIdleLoopRunning) {
                const idleEvent = this.mainEvents.dequeue();
                if (idleEvent) {
                    await this.handleIdleEvent(idleEvent);
                    this.mainEvents.enqueue(idleEvent);
                } else {
                    console.log("No idle events in queue");
                }
                // Wait for an interval time before processing the next event
                await this.wait(intervalRange); 
            }
        };

        processIdleEvents().catch(e => {
            console.error("Idle loop encountered an error:", e);
            this.isIdleLoopRunning = false; 
        });  
    }

    public stopIdleLoop() {
        this.isIdleLoopRunning = false;
        console.log("Stopping idle loop");
    }

    private async handleIdleEvent(event: AmicaLifeEvents) {
        console.log("Handling idle event:", event.events);
        try {
            await this.chat?.receiveMessage?.(event.messages.content, event.messages.role);
        } catch (error) {
            console.error("Error occurred while trying to use the chat instance:", error);
        }
    }

    private async wait(intervalRange: [number, number]) {
        const [minMs, maxMs] = intervalRange;
        const interval = Math.floor(Math.random() * (maxMs - minMs + 1) + minMs) * 1000;
        return new Promise(resolve => setTimeout(resolve, interval));
    }
}
  