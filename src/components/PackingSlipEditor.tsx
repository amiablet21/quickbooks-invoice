import { Check, Star } from 'lucide-react';
import { InvoiceData, fillRate } from '../types';
import { TextField, NumberField, TextAreaField, ReadOnlyField } from './Field';

interface Props {
  invoice: InvoiceData;
  onChange: (patch: Partial<InvoiceData>) => void;
  onSaveVendorDefault: () => void;
  vendorSaved: boolean;
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-stone-200 pt-6">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-400">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function PackingSlipEditor({
  invoice,
  onChange,
  onSaveVendorDefault,
  vendorSaved,
}: Props) {
  const rate = fillRate(invoice);

  return (
    <div className="space-y-6">
      <Section title="Packing Slip">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            label="Packing Slip Number"
            value={invoice.invoiceNumber}
            onChange={(v) => onChange({ invoiceNumber: v })}
          />
          <TextField
            label="Date"
            value={invoice.invoiceDate}
            onChange={(v) => onChange({ invoiceDate: v })}
            placeholder="MM/DD/YYYY"
          />
          <TextField
            label="Invoice #"
            value={invoice.relatedInvoiceNumber}
            onChange={(v) => onChange({ relatedInvoiceNumber: v })}
          />
        </div>
      </Section>

      <Section title="Shipment">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            label="Shipping Plan ID"
            value={invoice.shippingPlanId}
            onChange={(v) => onChange({ shippingPlanId: v })}
            placeholder="HOT-1783629261458"
          />
          <TextField
            label="Shipment ID"
            value={invoice.shipmentId}
            onChange={(v) => onChange({ shipmentId: v })}
            placeholder="9428627WFA"
          />
          <TextField
            label="Ship To (Fulfillment Center)"
            value={invoice.shipToFc}
            onChange={(v) => onChange({ shipToFc: v })}
            placeholder="IND3, Mccordsville, IN"
          />
          <TextField
            label="Est. Delivery"
            value={invoice.estDelivery}
            onChange={(v) => onChange({ estDelivery: v })}
            placeholder="Jul 14, 2026"
          />
          <TextField
            label="Status"
            value={invoice.shipmentStatus}
            onChange={(v) => onChange({ shipmentStatus: v })}
            placeholder="Completed"
          />
          <TextField
            label="Receiving Started"
            value={invoice.receivingStarted}
            onChange={(v) => onChange({ receivingStarted: v })}
            placeholder="Jul 12, 2026"
          />
        </div>
      </Section>

      <Section
        title="From (Vendor)"
        action={
          <button
            type="button"
            onClick={onSaveVendorDefault}
            title="Save these vendor details as the default for every new document"
            className={
              'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ' +
              (vendorSaved
                ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                : 'border-stone-300 text-stone-600 hover:bg-stone-50')
            }
          >
            {vendorSaved ? <Check size={13} /> : <Star size={13} />}
            {vendorSaved ? 'Saved as default' : 'Set as default'}
          </button>
        }
      >
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

      <Section title="Item">
        <TextAreaField
          label="Item Name"
          value={invoice.itemDescription}
          onChange={(v) => onChange({ itemDescription: v })}
          rows={2}
          placeholder="BRAND NEW Samsung Galaxy Tab…"
        />
        <div className="mt-4">
          <TextField
            label="SKU"
            value={invoice.sku}
            onChange={(v) => onChange({ sku: v })}
            placeholder="SM-X133-64GB-GREY"
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <NumberField
            label="Shipped Units"
            value={invoice.shippedUnits}
            onChange={(v) => onChange({ shippedUnits: v })}
          />
          <NumberField
            label="Received Units"
            value={invoice.receivedUnits}
            onChange={(v) => onChange({ receivedUnits: v })}
          />
          <NumberField
            label="Damaged Units"
            value={invoice.damagedUnits}
            onChange={(v) => onChange({ damagedUnits: v })}
          />
          <ReadOnlyField label="Fill Rate" value={`${rate.toFixed(1)}%`} />
        </div>
      </Section>

      <Section title="Notes">
        <TextField
          label="Notes"
          value={invoice.notes}
          onChange={(v) => onChange({ notes: v })}
        />
      </Section>
    </div>
  );
}
