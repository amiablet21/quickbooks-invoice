import { InvoiceData, computeTotals } from '../types';
import { TextField, NumberField, TextAreaField, ReadOnlyField } from './Field';
import ScreenshotImport from './ScreenshotImport';

interface InvoiceEditorProps {
  invoice: InvoiceData;
  onChange: (patch: Partial<InvoiceData>) => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-stone-200 pt-6">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-4">
        {title}
      </h3>
      {children}
    </section>
  );
}

export default function InvoiceEditor({ invoice, onChange }: InvoiceEditorProps) {
  const { amount, total } = computeTotals(invoice);

  return (
    <div className="space-y-6">
      <ScreenshotImport onApply={onChange} />

      <Section title="Invoice">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            label="Invoice Number"
            value={invoice.invoiceNumber}
            onChange={(v) => onChange({ invoiceNumber: v })}
          />
          <TextField
            label="Invoice Date"
            value={invoice.invoiceDate}
            onChange={(v) => onChange({ invoiceDate: v })}
            placeholder="MM/DD/YYYY"
          />
          <TextField
            label="PO Number"
            value={invoice.poNumber}
            onChange={(v) => onChange({ poNumber: v })}
          />
          <TextField
            label="Order Number"
            value={invoice.orderNumber}
            onChange={(v) => onChange({ orderNumber: v })}
          />
        </div>
      </Section>

      <Section title="From (Vendor)">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            label="Vendor Name"
            value={invoice.vendorName}
            onChange={(v) => onChange({ vendorName: v })}
            className="sm:col-span-2"
          />
          <TextField
            label="Address"
            value={invoice.vendorAddress}
            onChange={(v) => onChange({ vendorAddress: v })}
          />
          <TextField
            label="City / State / ZIP"
            value={invoice.vendorCity}
            onChange={(v) => onChange({ vendorCity: v })}
          />
          <TextField
            label="Phone"
            value={invoice.vendorPhone}
            onChange={(v) => onChange({ vendorPhone: v })}
          />
          <TextField
            label="Email"
            type="email"
            value={invoice.vendorEmail}
            onChange={(v) => onChange({ vendorEmail: v })}
          />
        </div>
      </Section>

      <Section title="Bill To (Customer)">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            label="Customer Name"
            value={invoice.customerName}
            onChange={(v) => onChange({ customerName: v })}
            className="sm:col-span-2"
          />
          <TextField
            label="Address"
            value={invoice.customerAddress}
            onChange={(v) => onChange({ customerAddress: v })}
          />
          <TextField
            label="City / State / ZIP"
            value={invoice.customerCity}
            onChange={(v) => onChange({ customerCity: v })}
          />
        </div>
      </Section>

      <Section title="Item">
        <TextAreaField
          label="Description"
          value={invoice.itemDescription}
          onChange={(v) => onChange({ itemDescription: v })}
          rows={3}
          placeholder="Product name, model, condition…"
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <NumberField
            label="Quantity"
            value={invoice.quantity}
            onChange={(v) => onChange({ quantity: v })}
          />
          <NumberField
            label="Unit Price ($)"
            value={invoice.unitPrice}
            step="0.01"
            onChange={(v) => onChange({ unitPrice: v })}
          />
          <ReadOnlyField label="Amount ($)" value={amount.toFixed(2)} />
        </div>
      </Section>

      <Section title="Shipping">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            label="Ship Method"
            value={invoice.shipMethod}
            onChange={(v) => onChange({ shipMethod: v })}
          />
          <TextField
            label="Tracking Number"
            value={invoice.tracking}
            onChange={(v) => onChange({ tracking: v })}
          />
          <NumberField
            label="Shipping Cost ($)"
            value={invoice.shipping}
            step="0.01"
            onChange={(v) => onChange({ shipping: v })}
          />
          <NumberField
            label="Tax & Fees ($)"
            value={invoice.tax}
            step="0.01"
            onChange={(v) => onChange({ tax: v })}
          />
          <ReadOnlyField label="Total ($)" value={total.toFixed(2)} emphasis />
        </div>
      </Section>

      <Section title="Footer">
        <div className="grid grid-cols-1 gap-4">
          <TextField
            label="Terms"
            value={invoice.terms}
            onChange={(v) => onChange({ terms: v })}
          />
          <TextField
            label="Notes"
            value={invoice.notes}
            onChange={(v) => onChange({ notes: v })}
          />
        </div>
      </Section>
    </div>
  );
}
