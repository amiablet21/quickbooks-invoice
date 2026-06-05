/// <reference types="vite/client" />

export {};

declare global {
  interface OcrResult {
    ok: boolean;
    text?: string;
    error?: string;
  }

  interface VendorProfileShape {
    vendorName: string;
    vendorAddress: string;
    vendorCity: string;
    vendorPhone: string;
    vendorEmail: string;
  }

  interface DesktopApi {
    isDesktop: boolean;
    scanImage: (dataUrl: string) => Promise<OcrResult>;
    getVendorProfile: () => Promise<VendorProfileShape | null>;
    saveVendorProfile: (profile: VendorProfileShape) => Promise<boolean>;
  }

  interface Window {
    api?: DesktopApi;
  }
}
