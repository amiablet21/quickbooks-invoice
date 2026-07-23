import { InvoiceData, fillRate } from '../types';

interface Props {
  invoice: InvoiceData;
}

function Meta({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-6 py-1">
      <span className="text-stone-500">{label}</span>
      <span className="text-stone-900 font-medium">{value}</span>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <span>
      <span className="text-stone-500">{label}: </span>
      <span className="text-stone-900 font-medium">{value}</span>
    </span>
  );
}

/** Packing slip laid out like an Amazon FBA inbound shipment summary. */
export default function PackingSlipPreview({ invoice }: Props) {
  const rate = fillRate(invoice);

  return (
    <div
      id="invoice-document"
      className="invoice-sheet bg-white text-stone-900 mx-auto w-full max-w-[816px] shadow-sm border border-stone-200 print:border-0 print:shadow-none"
    >
      <div className="px-12 py-12 print:px-10 print:py-10">
        {/* Header */}
        <header className="flex justify-between items-start gap-8 mb-8">
          <div className="max-w-[55%]">
            <h1 className="font-serif text-2xl leading-tight text-stone-900 mb-3">
              {invoice.vendorName || 'Your Company Name'}
            </h1>
            <div className="text-[13px] text-stone-600 leading-relaxed space-y-0.5">
              {invoice.vendorAddress && <p>{invoice.vendorAddress}</p>}
              {invoice.vendorCity && <p>{invoice.vendorCity}</p>}
              {invoice.vendorPhone && <p className="pt-1">{invoice.vendorPhone}</p>}
              {invoice.vendorEmail && <p>{invoice.vendorEmail}</p>}
            </div>
          </div>
          <div className="text-right">
            <h2 className="font-serif text-3xl tracking-[0.12em] whitespace-nowrap text-stone-900 mb-4">
              PACKING SLIP
            </h2>
            <div className="text-[13px] min-w-[200px] border-t border-stone-300 pt-3">
              <Meta label="Packing Slip #" value={invoice.invoiceNumber} />
              <Meta label="Date" value={invoice.invoiceDate} />
              <Meta label="Invoice #" value={invoice.relatedInvoiceNumber} />
            </div>
          </div>
        </header>

        {/* Shipping Plan ID */}
        <div className="mb-6">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 mb-1">
            Shipping Plan ID
          </div>
          <div className="font-serif text-xl text-stone-900">
            {invoice.shippingPlanId || '—'}
          </div>
        </div>

        {/* Shipment info bar */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-[13px] pb-4 mb-4 border-b border-stone-200">
          <Field label="Shipment ID" value={invoice.shipmentId} />
          <Field label="Ship to" value={invoice.shipToFc} />
          <Field label="Est. delivery" value={invoice.estDelivery} />
          {invoice.shipmentStatus && (
            <span className="inline-block text-[12px] font-medium text-sky-800 bg-sky-50 border border-sky-200 rounded-full px-2.5 py-0.5">
              {invoice.shipmentStatus}
            </span>
          )}
        </div>

        {/* Summary line */}
        <div className="text-[13px] text-stone-600 mb-6">
          1 item in this shipment
          <span className="mx-2 text-stone-300">|</span>
          Total shipped units: <span className="text-stone-900 font-medium">{invoice.shippedUnits}</span>
          <span className="mx-2 text-stone-300">|</span>
          Total received units: <span className="text-stone-900 font-medium">{invoice.receivedUnits}</span>
        </div>

        {/* Items table */}
        <table className="w-full text-[13px] mb-10">
          <thead>
            <tr className="border-b-2 border-stone-900 text-[11px] uppercase tracking-wider text-stone-500">
              <th className="text-left font-semibold py-2">Item name</th>
              <th className="text-left font-semibold py-2 w-40">SKU</th>
              <th className="text-right font-semibold py-2 w-20">Shipped</th>
              <th className="text-right font-semibold py-2 w-20">Received</th>
              <th className="text-right font-semibold py-2 w-20">Damaged</th>
              <th className="text-right font-semibold py-2 w-20">Fill rate</th>
              <th className="text-right font-semibold py-2 w-28">Receiving started</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-stone-200 align-top">
              <td className="py-3 pr-4 text-stone-800 whitespace-pre-line">
                {invoice.itemDescription || '—'}
              </td>
              <td className="py-3 pr-3 text-stone-800">{invoice.sku || '—'}</td>
              <td className="py-3 text-right text-stone-800">{invoice.shippedUnits}</td>
              <td className="py-3 text-right text-stone-800">{invoice.receivedUnits}</td>
              <td className="py-3 text-right text-stone-800">{invoice.damagedUnits}</td>
              <td className="py-3 text-right text-stone-900 font-medium">{rate.toFixed(1)}%</td>
              <td className="py-3 text-right text-stone-800">{invoice.receivingStarted || '—'}</td>
            </tr>
          </tbody>
        </table>

        {/* Footer */}
        {invoice.notes && (
          <footer className="border-t border-stone-200 pt-6 text-[13px] text-stone-500 leading-relaxed">
            {invoice.notes}
          </footer>
        )}
      </div>
    </div>
  );
}
