import { config } from "@/utils/config";

export const getBaseURL = (): string => {
    const currentURL = new URL(config("moshi_url"));
    const hostname = currentURL.hostname;
    const wsProtocol = currentURL.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${wsProtocol}//${hostname}/ws`; 
};
