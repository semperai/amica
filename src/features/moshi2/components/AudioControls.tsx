import React, { useState, useEffect } from "react";
import { Recorder } from "./Moshi";

interface AudioControlProps {
    recorder: Recorder | null;
}

const AudioControl: React.FC<AudioControlProps> = ({ recorder }) => {
    const [muted, setMuted] = useState<boolean>(true);

    const toggleMute = () => {
        if (!recorder) return;
        setMuted((prev) => !prev);
        recorder.setRecordingGain(muted ? 1 : 0);
    };

    useEffect(() => {
        if (recorder) {
            setMuted(false);
            recorder.setRecordingGain(1);
        }
    }, [recorder]);

    return (
        <div className="fixed bottom-5 z-20 w-full">
            <div className="flex flex-col justify-center items-center">
                <div
                    className={`rounded-full transition-all duration-100 ease-out hover:cursor-pointer backdrop-blur-lg ${
                        muted ? "bg-gray-200 hover:bg-red-300" : "bg-red-500 hover:bg-red-300"
                    }`}
                    onClick={toggleMute}
                    style={{
                        width: "25px",
                        height: "25px",
                    }}
                ></div>
            </div>
        </div>
    );
};

export default AudioControl;
