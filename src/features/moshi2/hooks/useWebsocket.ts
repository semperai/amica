import { useEffect, useRef } from "react";

export const useWebSocket = (
    url: URL,
    onOpen: () => void,
    onMessage: (event: MessageEvent) => void,
    onClose: () => void
) => {
    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        const socket = new WebSocket(url);
        socketRef.current = socket;

        socket.onopen = onOpen;
        socket.onmessage = onMessage;
        socket.onclose = onClose;

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }
        };
    }, [url, onOpen, onMessage, onClose]);

    return socketRef;
};
