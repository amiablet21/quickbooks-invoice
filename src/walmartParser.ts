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
  // Labels and their right-aligned values often land on separate OCR lines, so
  // allow a short gap (including newlines) between the label and its "$" amount.
  const subtotal = money(/Subtotal[^$]{0,60}\$\s*([\d,]+\.\d{2})/i);
  const shippingFee = money(/Shipping\s*fee[^$]{0,60}\$\s*([\d,]+\.\d{2})/i);
  const taxes = money(/Tax(?:es)?[^$]{0,60}\$\s*([\d,]+\.\d{2})/i);
  const total = money(/\bTotal[^$]{0,60}\$\s*([\d,]+\.\d{2})/i);

  // Quantity: prefer "Subtotal (1 item)", fall back to "x1".
  let qty = 1;
  const qtyItems = text.match(/\(\s*(\d+)\s*items?\s*\)/i);
  const qtyX = text.match(/\bx\s?(\d{1,3})\b/i);
  if (qtyItems) qty = Number(qtyItems[1]);
  else if (qtyX) qty = Number(qtyX[1]);
  set('quantity', qty, 'Quantity');

  // The per-item sold price is shown in the item block, ABOVE the order totals.
  // Take the first "$" amount before the totals section (so we don't grab the
  // subtotal/total), then fall back to deriving it from the totals if needed.
  const totalsAt = text.search(/Subtotal|Grand\s*total|Order\s*total|\bTotal\b/i);
  const itemRegion = totalsAt >= 0 ? text.slice(0, totalsAt) : text;
  const itemPriceMatch = itemRegion.match(/\$\s*([\d,]+\.\d{2})/);
  const itemPrice = itemPriceMatch ? Number(itemPriceMatch[1].replace(/,/g, '')) : null;

  let unitPrice: number | null = null;
  if (itemPrice != null) unitPrice = itemPrice;
  else if (subtotal != null) unitPrice = qty > 0 ? subtotal / qty : subtotal;
  else if (total != null) unitPrice = (total - (shippingFee || 0) - (taxes || 0)) / (qty || 1);
  if (unitPrice != null) set('unitPrice', Number(unitPrice.toFixed(2)), 'Unit Price');

  // Intentionally NOT importing shipping or tax — the invoice shows only the
  // item's sales price. (subtotal/total above are used solely to derive the
  // unit price when the item-line price can't be read.)

  // --- Item description ----------------------------------------------------
  const condition = text.match(/Condition\s*:?\s*([A-Za-z]+)/i);
  const model = text.match(/\b([A-Z]{2,}[A-Z0-9]*\d[A-Z0-9]*)\b/); // e.g. UTSMT220

  const isLabelLine = (l: string) =>
    /^(Delivered|Shipped|Shipping|Ship|Order|PO|Carrier|Variant|Condition|Returned|Cancelled|Refund|Download|Print|Back to|Customer|Subtotal|Grand|Total|Tax|Fulfilled|Deliver|Tracking|Copy|Email|Amount|Qty|Rate|Item|Bill|Sold|Date)\b/i.test(
      l
    );

  // Heuristic for "this line is the product/listing title".
  const looksLikeTitle = (l: string) =>
    l.length > 8 &&
    /[A-Za-z]{3,}/.test(l) &&
    l.trim().split(/\s+/).length >= 2 &&
    !isLabelLine(l) &&
    !/^[$\d]/.test(l) && // not a price/number
    !/,\s*[A-Z]{2}\s*\d{5}/.test(l) && // not a city/state/zip
    !/^[A-Z0-9][A-Z0-9-]{3,}$/.test(l); // not a bare SKU/code

  // The product title sits just above the Variant/Condition/SKU details. Look
  // in that window first; otherwise take the most title-like line near the top.
  let title = '';
  const anchorIdx = lines.findIndex((l) => /Variant\s*:|Condition\s*:/i.test(l));
  if (anchorIdx > 0) {
    for (let i = anchorIdx - 1; i >= 0 && i >= anchorIdx - 4; i--) {
      if (looksLikeTitle(lines[i])) {
        title = lines[i];
        break;
      }
    }
  }
  if (!title) {
    const candidates = lines.slice(0, 14).filter(looksLikeTitle);
    if (candidates.length) title = candidates.sort((a, b) => b.length - a.length)[0];
  }

  const descParts: string[] = [];
  if (title) descParts.push(title);
  const sub: string[] = [];
  if (model && (!title || !title.includes(model[1]))) sub.push(model[1]);
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
