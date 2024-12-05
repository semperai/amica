import { useEffect, useRef } from "react";

export const useWebSocket = (
    url: string,
    onOpen: () => void,
    onMessage: (event: MessageEvent) => void,
    onClose: () => void,
    stopAllAction: () => void
) => {
    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        const socket = new WebSocket(url);
        socketRef.current = socket;

        socket.onopen = onOpen;
        socket.onmessage = onMessage;
        socket.onclose = onClose;

        return () => {
            stopAllAction();
        };
    }, []);

    return socketRef;
};
