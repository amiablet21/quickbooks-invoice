import { InvoiceData, computeTotals } from '../types';

interface InvoicePreviewProps {
  invoice: InvoiceData;
}

function money(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function MetaRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-6 py-1">
      <span className="text-stone-500">{label}</span>
      <span className="text-stone-900 font-medium">{value}</span>
    </div>
  );
}

export default function InvoicePreview({ invoice }: InvoicePreviewProps) {
  const { amount, subtotal, total } = computeTotals(invoice);

  return (
    <div
      id="invoice-document"
      className="invoice-sheet bg-white text-stone-900 mx-auto w-full max-w-[816px] shadow-sm border border-stone-200 print:border-0 print:shadow-none"
    >
      <div className="px-12 py-12 print:px-10 print:py-10">
        {/* Header */}
        <header className="flex justify-between items-start gap-8 mb-10">
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
            <h2 className="font-serif text-4xl tracking-[0.2em] text-stone-900 mb-4">
              INVOICE
            </h2>
            <div className="text-[13px] min-w-[200px] border-t border-stone-300 pt-3">
              <MetaRow label="Invoice #" value={invoice.invoiceNumber} />
              <MetaRow label="Date" value={invoice.invoiceDate} />
              <MetaRow label="PO #" value={invoice.poNumber} />
            </div>
          </div>
        </header>

        {/* Bill To / Ship To */}
        <div className="grid grid-cols-2 gap-10 mb-10">
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 mb-2 pb-2 border-b border-stone-200">
              Bill To
            </h3>
            <div className="text-[13px] text-stone-800 leading-relaxed">
              {invoice.customerName && <p className="font-medium">{invoice.customerName}</p>}
              {invoice.customerAddress && <p>{invoice.customerAddress}</p>}
              {invoice.customerCity && <p>{invoice.customerCity}</p>}
            </div>
          </div>
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 mb-2 pb-2 border-b border-stone-200">
              Ship To
            </h3>
            <div className="text-[13px] text-stone-800 leading-relaxed">
              {invoice.customerName && <p className="font-medium">{invoice.customerName}</p>}
              {invoice.customerAddress && <p>{invoice.customerAddress}</p>}
              {invoice.customerCity && <p>{invoice.customerCity}</p>}
              {invoice.shipMethod && (
                <p className="pt-1.5">
                  <span className="text-stone-500">Ship Method: </span>
                  {invoice.shipMethod}
                </p>
              )}
              {invoice.tracking && (
                <p>
                  <span className="text-stone-500">Tracking #: </span>
                  {invoice.tracking}
                </p>
              )}
              {invoice.orderNumber && (
                <p>
                  <span className="text-stone-500">Order #: </span>
                  {invoice.orderNumber}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Items */}
        <table className="w-full text-[13px] mb-10">
          <thead>
            <tr className="border-b-2 border-stone-900 text-[11px] uppercase tracking-wider text-stone-500">
              <th className="text-left font-semibold py-2 w-8">#</th>
              <th className="text-left font-semibold py-2">Description</th>
              <th className="text-right font-semibold py-2 w-16">Qty</th>
              <th className="text-right font-semibold py-2 w-28">Rate</th>
              <th className="text-right font-semibold py-2 w-28">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-stone-200 align-top">
              <td className="py-3 text-stone-500">1</td>
              <td className="py-3 text-stone-800 whitespace-pre-line pr-4">
                {invoice.itemDescription || '—'}
              </td>
              <td className="py-3 text-right text-stone-800">{invoice.quantity}</td>
              <td className="py-3 text-right text-stone-800">${money(invoice.unitPrice)}</td>
              <td className="py-3 text-right text-stone-900 font-medium">${money(amount)}</td>
            </tr>
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-12">
          <div className="w-72 text-[13px]">
            <div className="flex justify-between py-2 border-b border-stone-200">
              <span className="text-stone-500">Subtotal</span>
              <span className="text-stone-900">${money(subtotal)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-stone-200">
              <span className="text-stone-500">Shipping &amp; Handling</span>
              <span className="text-stone-900">${money(invoice.shipping)}</span>
            </div>
            {invoice.tax > 0 && (
              <div className="flex justify-between py-2 border-b border-stone-200">
                <span className="text-stone-500">Tax &amp; Fees</span>
                <span className="text-stone-900">${money(invoice.tax)}</span>
              </div>
            )}
            <div className="flex justify-between py-3 mt-1">
              <span className="font-serif text-base text-stone-900">Total</span>
              <span className="font-serif text-base text-stone-900">${money(total)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        {(invoice.terms || invoice.notes) && (
          <footer className="border-t border-stone-200 pt-6 text-[13px] text-stone-600 leading-relaxed space-y-2">
            {invoice.terms && (
              <p>
                <span className="font-medium text-stone-800">Terms: </span>
                {invoice.terms}
              </p>
            )}
            {invoice.notes && <p className="text-stone-500">{invoice.notes}</p>}
          </footer>
        )}
      </div>
    </div>
  );
}
