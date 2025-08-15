"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    proxyRequestBlocking: function (payload) { return electron_1.ipcRenderer.invoke('proxy_request_blocking', payload); },
    proxyRequestStreaming: function (payload, onChunk, onEnd, onError) {
        electron_1.ipcRenderer.on('stream-chunk', function (event, chunk) { return onChunk(chunk); });
        electron_1.ipcRenderer.on('stream-end', function (event) { return onEnd(); });
        electron_1.ipcRenderer.on('stream-error', function (event, error) { return onError(error); });
        electron_1.ipcRenderer.send('proxy_request_streaming', payload);
    },
    startSidecar: function (payload, onOutput) {
        electron_1.ipcRenderer.on('sidecar-output', function (event, output) { return onOutput(output); });
        return electron_1.ipcRenderer.invoke('start_sidecar', payload);
    },
    stopSidecar: function () { return electron_1.ipcRenderer.invoke('stop_sidecar'); },
});
