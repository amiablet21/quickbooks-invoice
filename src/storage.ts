import { InvoiceData } from './types';

const STORAGE_KEY = 'invoices.v1';

export function loadInvoices(): InvoiceData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as InvoiceData[];
    if (!Array.isArray(parsed)) return [];
    // Backfill fields added in later versions so totals never become NaN.
    const normalized = parsed.map((i) => ({ ...i, tax: i.tax ?? 0 }));
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
