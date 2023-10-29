import { useEffect, useRef } from "react";

export default function AudioPlayer(props: {
  audioUrl: string;
  mimeType: string;
}) {
  const audioPlayer = useRef<HTMLAudioElement>(null);
  const audioSource = useRef<HTMLSourceElement>(null);

  // Updates src when url changes
  useEffect(() => {
    if (audioPlayer.current && audioSource.current) {
      audioSource.current.src = props.audioUrl;
      audioPlayer.current.load();
    }
  }, [props.audioUrl]);

  return (
    <audio
      ref={audioPlayer}
      className='hidden'
    >
      <source ref={audioSource} type={props.mimeType}></source>
    </audio>
  );
}
