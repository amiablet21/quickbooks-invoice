import { InvoiceData } from './types';

export interface ParseResult {
  patch: Partial<InvoiceData>;
  filled: string[];
}

function clean(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

function capitalize(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1).toLowerCase() : s;
}

/**
 * Parse the raw OCR text of a Walmart Marketplace order page into invoice
 * fields. Uses label-anchored regexes (PO#, Order#, Ship method, …) so it
 * still works when OCR reads the two-column layout out of order. Vendor
 * fields are intentionally left untouched — that's the user's own company,
 * configured once, and not present on the order page.
 */
export function parseWalmartText(raw: string): ParseResult {
  const text = raw.replace(/\r/g, '');
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const patch: Partial<InvoiceData> = {};
  const filled: string[] = [];
  const set = <K extends keyof InvoiceData>(key: K, val: InvoiceData[K], label: string) => {
    patch[key] = val;
    filled.push(label);
  };

  // --- Identifiers ---------------------------------------------------------
  const po = text.match(/PO\s*#\s*:?\s*([0-9]{6,})/i);
  if (po) set('poNumber', po[1], 'PO Number');

  const order = text.match(/Order\s*#?\s*:?\s*([0-9]{8,})/i);
  if (order && order[1] !== po?.[1]) set('orderNumber', order[1], 'Order Number');

  const ordered = text.match(/Ordered\s*:?\s*([01]?\d\/[0-3]?\d\/\d{4})/i);
  if (ordered) set('invoiceDate', ordered[1], 'Invoice Date');

  // --- Shipping ------------------------------------------------------------
  const ship = text.match(/Ship\s*method\s*:?\s*([A-Za-z][A-Za-z ]*)/i);
  if (ship) set('shipMethod', clean(ship[1]), 'Ship Method');

  const ups = text.match(/\b(1Z[0-9A-Z]{10,20})\b/);
  if (ups) {
    set('tracking', `UPS ${ups[1]}`, 'Tracking Number');
  } else {
    const trk = text.match(/(UPS|USPS|FedEx|DHL)\s+([0-9A-Z]{10,30})/i);
    if (trk) set('tracking', `${trk[1].toUpperCase()} ${trk[2]}`, 'Tracking Number');
  }

  // --- Money ---------------------------------------------------------------
  const money = (re: RegExp): number | null => {
    const m = text.match(re);
    return m ? Number(m[1].replace(/,/g, '')) : null;
  };
  const subtotal = money(/Subtotal[^$\n]*\$\s*([\d,]+\.\d{2})/i);
  const shippingFee = money(/Shipping\s*fee\s*:?[^$\n]*\$\s*([\d,]+\.\d{2})/i);
  const taxes = money(/Tax(?:es)?[^$\n]*\$\s*([\d,]+\.\d{2})/i);

  // Quantity: prefer "Subtotal (1 item)", fall back to "x1".
  let qty = 1;
  const qtyItems = text.match(/\(\s*(\d+)\s*items?\s*\)/i);
  const qtyX = text.match(/\bx\s?(\d{1,3})\b/i);
  if (qtyItems) qty = Number(qtyItems[1]);
  else if (qtyX) qty = Number(qtyX[1]);
  set('quantity', qty, 'Quantity');

  if (subtotal != null) {
    const unit = qty > 0 ? subtotal / qty : subtotal;
    set('unitPrice', Number(unit.toFixed(2)), 'Unit Price');
  }
  if (shippingFee != null) set('shipping', shippingFee, 'Shipping Cost');
  if (taxes != null) set('tax', taxes, 'Tax');

  // --- Item description ----------------------------------------------------
  const condition = text.match(/Condition\s*:?\s*([A-Za-z]+)/i);
  const model = text.match(/\b([A-Z]{2,}[A-Z0-9]*\d[A-Z0-9]*)\b/); // e.g. UTSMT220

  let title = '';
  const variantIdx = lines.findIndex((l) => /^Variant\s*:/i.test(l));
  const anchorIdx = variantIdx >= 0 ? variantIdx : lines.findIndex((l) => /^Condition\s*:/i.test(l));
  if (anchorIdx > 0) {
    for (let i = anchorIdx - 1; i >= 0 && i >= anchorIdx - 3; i--) {
      const l = lines[i];
      if (
        l.length > 8 &&
        /[A-Za-z]{3,}/.test(l) &&
        !/^(Delivered|Shipping|Order|PO|Carrier|Variant|Condition|Returned|Cancelled)/i.test(l)
      ) {
        title = l;
        break;
      }
    }
  }

  const descParts: string[] = [];
  if (title) descParts.push(title);
  const sub: string[] = [];
  if (model) sub.push(model[1]);
  if (condition) sub.push(`Condition: ${capitalize(condition[1])}`);
  if (sub.length) descParts.push(sub.join(' | '));
  if (descParts.length) set('itemDescription', descParts.join('\n'), 'Item Description');

  // --- Customer + shipping address ----------------------------------------
  const cszRe = /[A-Za-z].*,\s*[A-Z]{2}\s*\d{5}(?:-\d{4})?/;
  const addrIdx = lines.findIndex((l) => /^Shipping address/i.test(l));
  if (addrIdx >= 0) {
    const after = lines.slice(addrIdx + 1, addrIdx + 6);
    const cszIdx = after.findIndex((l) => cszRe.test(l));
    if (cszIdx >= 1) {
      const name = after[0];
      const streetLines = after.slice(1, cszIdx);
      const cszMatch = after[cszIdx].match(cszRe);
      if (name && /[A-Za-z]/.test(name)) set('customerName', clean(name), 'Customer Name');
      if (streetLines.length) set('customerAddress', clean(streetLines.join(', ')), 'Customer Address');
      if (cszMatch) set('customerCity', clean(cszMatch[0]), 'City / State / ZIP');
    }
  }

  // Fallback: name from "Customer details".
  if (!patch.customerName) {
    const cust = text.match(/Customer details\s*\n\s*([A-Za-z][A-Za-z .'-]+)/i);
    if (cust) set('customerName', clean(cust[1]), 'Customer Name');
  }

  return { patch, filled };
}
