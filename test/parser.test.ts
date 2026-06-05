import { parseWalmartText } from '../src/walmartParser';

// Approximates Tesseract output for a Walmart order page, including the kind of
// line interleaving OCR produces across the two columns.
// NOTE: all names, addresses, and numbers below are fictional sample data.
const sample = `Back to dashboard
PO# 100000000000001
Download Print order Adjust Refund
Delivered
SAMSUNG Galaxy Tab A7 Lite 8.7" 32GB Dark Gray (Wi-Fi), Gray
Variant: Dark Gray
UTSMT220 Condition: New
$120.96
x1
Order details
Order#: 200000000000002
Ship node: Acme Resellers LLC - 10000000000 - MP
Ship method: Expedited
Ordered: 05/16/2026
Ship by: 05/16/2026
Deliver by: 05/19/2026
Fulfilled by: Seller
Shipping details
Carrier / Tracking
UPS 1ZW1234X5678901234
Delivery
Tue, May 19, 9:11 AM
Customer details
Jordan Example
Copy email address Email customer
Shipping address
Jordan Example
742 Sample Avenue
Springfield, IL 62704
Print packing slip
Subtotal (1 item) $120.96
Shipping fee: $0.00
Taxes and other fees: $6.41
Total: $127.37
Amount Adjusted: $0.00`;

const expected: Record<string, unknown> = {
  poNumber: '100000000000001',
  orderNumber: '200000000000002',
  invoiceDate: '05/16/2026',
  shipMethod: 'Expedited',
  tracking: 'UPS 1ZW1234X5678901234',
  quantity: 1,
  unitPrice: 120.96,
  shipping: 0,
  tax: 6.41,
  customerName: 'Jordan Example',
  customerAddress: '742 Sample Avenue',
  customerCity: 'Springfield, IL 62704',
  itemDescription:
    'SAMSUNG Galaxy Tab A7 Lite 8.7" 32GB Dark Gray (Wi-Fi), Gray\nUTSMT220 | Condition: New',
};

const { patch, filled } = parseWalmartText(sample);

let failures = 0;
for (const [key, want] of Object.entries(expected)) {
  const got = (patch as Record<string, unknown>)[key];
  const ok = got === want;
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${key}: ${JSON.stringify(got)}${ok ? '' : `  (expected ${JSON.stringify(want)})`}`);
}

console.log(`\nFilled fields (${filled.length}): ${filled.join(', ')}`);

// Second case: quantity > 1 should divide the subtotal into a unit price.
const multi = `PO# 999\nOrder#: 12345678\nUTSMT220 Condition: New\nVariant: Blue\nWidget Pro\nSubtotal (3 items) $90.00\nShipping fee: $5.00\nTaxes and other fees: $0.00\nTotal: $95.00`;
const r2 = parseWalmartText(multi);
const unitOk = r2.patch.unitPrice === 30 && r2.patch.quantity === 3;
if (!unitOk) failures++;
console.log(`${unitOk ? 'PASS' : 'FAIL'}  multi-qty unit price: qty=${r2.patch.quantity} unit=${r2.patch.unitPrice} (expected qty=3 unit=30)`);

console.log(`\n${failures === 0 ? 'ALL PASS' : failures + ' FAILURE(S)'}`);
process.exit(failures === 0 ? 0 : 1);
