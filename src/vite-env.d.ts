/// <reference types="vite/client" />

export {};

declare global {
  interface OcrResult {
    ok: boolean;
    text?: string;
    error?: string;
  }

  interface DesktopApi {
    isDesktop: boolean;
    scanImage: (dataUrl: string) => Promise<OcrResult>;
  }

  interface Window {
    api?: DesktopApi;
  }
}
