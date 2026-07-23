import { InvoiceData, VendorProfile } from './types';

const STORAGE_KEY = 'invoices.v1';
const VENDOR_KEY = 'vendorProfile.v1';

// Browser/localStorage fallback for the default vendor profile. In the desktop
// app the profile is stored via the main process (see preload `api`), which
// persists it as a JSON file in the app's user-data folder.
export function loadVendorProfileLocal(): VendorProfile | null {
  try {
    const raw = localStorage.getItem(VENDOR_KEY);
    return raw ? (JSON.parse(raw) as VendorProfile) : null;
  } catch {
    return null;
  }
}

export function saveVendorProfileLocal(profile: VendorProfile): void {
  try {
    localStorage.setItem(VENDOR_KEY, JSON.stringify(profile));
  } catch {
    /* ignore */
  }
}

export function loadInvoices(): InvoiceData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as InvoiceData[];
    if (!Array.isArray(parsed)) return [];
    // Backfill fields added in later versions so totals never become NaN.
    const normalized = parsed.map((i) => ({
      ...i,
      tax: i.tax ?? 0,
      docType: i.docType ?? 'invoice',
      relatedInvoiceNumber: i.relatedInvoiceNumber ?? '',
      shippingPlanId: i.shippingPlanId ?? '',
      shipmentId: i.shipmentId ?? '',
      shipToFc: i.shipToFc ?? '',
      estDelivery: i.estDelivery ?? '',
      shipmentStatus: i.shipmentStatus ?? '',
      sku: i.sku ?? '',
      shippedUnits: i.shippedUnits ?? 0,
      receivedUnits: i.receivedUnits ?? 0,
      damagedUnits: i.damagedUnits ?? 0,
      receivingStarted: i.receivingStarted ?? '',
    }));
    return normalized.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

function persist(invoices: InvoiceData[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
}

/** Insert or update an invoice, returning the full sorted list. */
export function saveInvoice(invoice: InvoiceData): InvoiceData[] {
  const invoices = loadInvoices();
  const stamped = { ...invoice, updatedAt: Date.now() };
  const idx = invoices.findIndex((i) => i.id === invoice.id);
  if (idx >= 0) {
    invoices[idx] = stamped;
  } else {
    invoices.push(stamped);
  }
  invoices.sort((a, b) => b.updatedAt - a.updatedAt);
  persist(invoices);
  return invoices;
}

export function deleteInvoice(id: string): InvoiceData[] {
  const invoices = loadInvoices().filter((i) => i.id !== id);
  persist(invoices);
  return invoices;
}
