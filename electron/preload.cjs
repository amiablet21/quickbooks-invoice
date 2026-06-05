const { contextBridge, ipcRenderer } = require('electron');

// Preload runs in an isolated context before the renderer loads.
// We expose a tiny, explicit API — only an OCR call, nothing else.
contextBridge.exposeInMainWorld('api', {
  isDesktop: true,
  scanImage: (dataUrl) => ipcRenderer.invoke('ocr:scan', dataUrl),
  getVendorProfile: () => ipcRenderer.invoke('vendor:get'),
  saveVendorProfile: (profile) => ipcRenderer.invoke('vendor:set', profile),
});

window.addEventListener('DOMContentLoaded', () => {
  document.documentElement.setAttribute('data-platform', 'electron');
});
