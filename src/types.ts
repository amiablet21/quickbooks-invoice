export type DocType = 'invoice' | 'credit-memo' | 'packing-slip';

export interface InvoiceData {
  id: string;
  docType: DocType;
  /** Document number: INV-… for invoices, CM-… for credit memos. */
  invoiceNumber: string;
  /** Credit memos only: the number of the invoice being credited. */
  relatedInvoiceNumber: string;
  poNumber: string;
  orderNumber: string;
  invoiceDate: string;

  customerName: string;
  customerAddress: string;
  customerCity: string;

  vendorName: string;
  vendorAddress: string;
  vendorCity: string;
  vendorPhone: string;
  vendorEmail: string;

  itemDescription: string;
  quantity: number;
  unitPrice: number;

  shipping: number;
  tax: number;
  shipMethod: string;
  tracking: string;

  // Packing slip (Amazon FBA inbound shipment) fields
  shippingPlanId: string;
  shipmentId: string;
  shipToFc: string;
  estDelivery: string;
  shipmentStatus: string;
  sku: string;
  shippedUnits: number;
  receivedUnits: number;
  damagedUnits: number;
  receivingStarted: string;

  terms: string;
  notes: string;

  updatedAt: number;
}

/** Received ÷ shipped, as a percentage (matches Amazon's "Fill rate"). */
export function fillRate(inv: InvoiceData): number {
  return inv.shippedUnits > 0 ? (inv.receivedUnits / inv.shippedUnits) * 100 : 0;
}

function todayFormatted(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createBlankInvoice(): InvoiceData {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return {
    id: generateId(),
    docType: 'invoice',
    invoiceNumber: `INV-${randomNum}`,
    relatedInvoiceNumber: '',
    poNumber: '',
    orderNumber: '',
    invoiceDate: todayFormatted(),

    customerName: '',
    customerAddress: '',
    customerCity: '',

    vendorName: 'Your Company Name',
    vendorAddress: '',
    vendorCity: '',
    vendorPhone: '',
    vendorEmail: '',

    itemDescription: '',
    quantity: 1,
    unitPrice: 0,

    shipping: 0,
    tax: 0,
    shipMethod: '',
    tracking: '',

    shippingPlanId: '',
    shipmentId: '',
    shipToFc: '',
    estDelivery: '',
    shipmentStatus: '',
    sku: '',
    shippedUnits: 0,
    receivedUnits: 0,
    damagedUnits: 0,
    receivingStarted: '',

    terms: 'Payment is due upon receipt.',
    notes: 'Thank you for your business!',

    updatedAt: Date.now(),
  };
}

/** CM number derived from the invoice it credits: INV-483920 → CM-483920. */
export function creditMemoNumberFor(invoiceNumber: string): string {
  const digits = invoiceNumber.replace(/\D/g, '');
  return `CM-${digits || Math.floor(100000 + Math.random() * 900000)}`;
}

export function createCreditMemo(source: InvoiceData): InvoiceData {
  return {
    ...source,
    id: generateId(),
    docType: 'credit-memo',
    invoiceNumber: creditMemoNumberFor(source.invoiceNumber),
    relatedInvoiceNumber: source.invoiceNumber,
    invoiceDate: todayFormatted(),
    terms: 'Credit issued against the original invoice referenced above.',
    notes: '',
    updatedAt: Date.now(),
  };
}

/** Packing slip number derived from the invoice: INV-483920 → PS-483920. */
export function packingSlipNumberFor(invoiceNumber: string): string {
  const digits = invoiceNumber.replace(/\D/g, '');
  return `PS-${digits || Math.floor(100000 + Math.random() * 900000)}`;
}

/** A packing slip carries the same shipment details as the invoice, but shows
 *  no prices or totals — just what's in the box. */
export function createPackingSlip(source: InvoiceData): InvoiceData {
  return {
    ...source,
    id: generateId(),
    docType: 'packing-slip',
    invoiceNumber: packingSlipNumberFor(source.invoiceNumber),
    relatedInvoiceNumber: source.invoiceNumber,
    invoiceDate: todayFormatted(),
    // Amazon-FBA fields start blank — filled from the seller shipment page.
    shippingPlanId: '',
    shipmentId: '',
    shipToFc: '',
    estDelivery: '',
    shipmentStatus: '',
    sku: '',
    shippedUnits: 0,
    receivedUnits: 0,
    damagedUnits: 0,
    receivingStarted: '',
    terms: '',
    notes: '',
    updatedAt: Date.now(),
  };
}

export interface VendorProfile {
  vendorName: string;
  vendorAddress: string;
  vendorCity: string;
  vendorPhone: string;
  vendorEmail: string;
}

export function extractVendor(invoice: InvoiceData): VendorProfile {
  return {
    vendorName: invoice.vendorName,
    vendorAddress: invoice.vendorAddress,
    vendorCity: invoice.vendorCity,
    vendorPhone: invoice.vendorPhone,
    vendorEmail: invoice.vendorEmail,
  };
}

export function computeTotals(invoice: InvoiceData) {
  const amount = invoice.quantity * invoice.unitPrice;
  const subtotal = amount;
  const total = subtotal + invoice.shipping + invoice.tax;
  return { amount, subtotal, total };
}
