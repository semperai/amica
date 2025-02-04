import { useEffect, useRef } from "react";
import { OggOpusDecoder } from "ogg-opus-decoder";

export const useAudioDecoder = () => {
    const decoderRef = useRef<any | null>(null);

    useEffect(() => {
        const initializeDecoder = async () => {
            const decoder = new OggOpusDecoder();
            await decoder.ready;
            decoderRef.current = decoder;
        };

        initializeDecoder();

        return () => {
            if (decoderRef.current) {
                decoderRef.current.free();
            }
        };
    }, []);

    return decoderRef;
};
