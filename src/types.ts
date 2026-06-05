export interface InvoiceData {
  id: string;
  invoiceNumber: string;
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

  terms: string;
  notes: string;

  updatedAt: number;
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
    invoiceNumber: `INV-${randomNum}`,
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

    terms: 'Payment is due upon receipt.',
    notes: 'Thank you for your business!',

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
