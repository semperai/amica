import { useMicVAD, utils } from "@ricky0123/vad-react"
import { useState } from "react"

export const VAD = () => {
  const [audioList, setAudioList] = useState<string[]>([])
  const vad = useMicVAD({
    onSpeechEnd: (audio) => {
      const wavBuffer = utils.encodeWAV(audio)
      const base64 = utils.arrayBufferToBase64(wavBuffer)
      const url = `data:audio/wav;base64,${base64}`
      setAudioList((old) => {
        return [url, ...old]
      })
    },
  });

  // console.log('vad', vad);
  return (
    <div className="bg-white z-50">
      <h6>Listening</h6>
      {!vad.listening && "Not"} listening
      <h6>Loading</h6>
      {!vad.loading && "Not"} loading
      <h6>Errored</h6>
      {!vad.errored && "Not"} errored
      <h6>User Speaking</h6>
      {!vad.userSpeaking && "Not"} speaking
      <h6>Audio count</h6>
      {audioList.length}
      <h6>Start/Pause</h6>
      <button onClick={vad.pause} 
            className="inline-flex items-center rounded-md bg-secondary px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-secondary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"

      >Pause</button>
      <button onClick={vad.start}
            className="inline-flex items-center rounded-md bg-secondary px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-secondary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
      >Start</button>
      <button onClick={vad.toggle}
            className="inline-flex items-center rounded-md bg-secondary px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-secondary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
      >Toggle</button>
    </div>
  )
}

export default VAD;
