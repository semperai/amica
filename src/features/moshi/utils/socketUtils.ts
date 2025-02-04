import { config } from "@/utils/config";

export const getBaseURL = (): string => {
    const currentURL = new URL(config("moshi_url"));
    const hostname = currentURL.hostname;
    const port = currentURL.port ? `:${currentURL.port}` : '';
    const wsProtocol = currentURL.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${wsProtocol}//${hostname}${port}/ws`; 
};
