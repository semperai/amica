import { config } from "@/utils/config";

export const getBaseURL = (): URL => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const url = new URL(`${wsProtocol}://${config("moshi_url")}/ws`);
    return url;
};
