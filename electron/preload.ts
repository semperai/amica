import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  proxyRequestBlocking: (payload) => ipcRenderer.invoke('proxy_request_blocking', payload),
  proxyRequestStreaming: (payload, onChunk, onEnd, onError) => {
    ipcRenderer.on('stream-chunk', (event, chunk) => onChunk(chunk));
    ipcRenderer.on('stream-end', (event) => onEnd());
    ipcRenderer.on('stream-error', (event, error) => onError(error));
    ipcRenderer.send('proxy_request_streaming', payload);
  },
  startSidecar: (payload, onOutput) => {
    ipcRenderer.on('sidecar-output', (event, output) => onOutput(output));
    return ipcRenderer.invoke('start_sidecar', payload);
  },
  stopSidecar: () => ipcRenderer.invoke('stop_sidecar'),
});
