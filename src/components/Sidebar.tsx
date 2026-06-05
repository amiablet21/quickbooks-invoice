import { FilePlus, Trash2, FileText } from 'lucide-react';
import { InvoiceData, computeTotals } from '../types';

interface SidebarProps {
  invoices: InvoiceData[];
  activeId: string;
  dirty: boolean;
  onNew: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

export default function Sidebar({
  invoices,
  activeId,
  dirty,
  onNew,
  onSelect,
  onDelete,
}: SidebarProps) {
  return (
    <aside className="w-72 shrink-0 h-screen flex flex-col bg-stone-50 border-r border-stone-200">
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-7 h-7 rounded-md bg-stone-900 text-white flex items-center justify-center">
            <FileText size={15} />
          </div>
          <span className="font-serif text-base text-stone-900">Invoices</span>
        </div>
        <button
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-stone-900 rounded-md hover:bg-stone-700 transition-colors"
        >
          <FilePlus size={16} />
          New Invoice
        </button>
      </div>

      <div className="px-5 pb-2 text-[11px] font-semibold uppercase tracking-widest text-stone-400">
        Saved ({invoices.length})
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-6 space-y-1">
        {invoices.length === 0 && (
          <p className="px-2 py-4 text-sm text-stone-400 leading-relaxed">
            No saved invoices yet. Fill out the form and click Save.
          </p>
        )}
        {invoices.map((inv) => {
          const isActive = inv.id === activeId;
          const { total } = computeTotals(inv);
          return (
            <div
              key={inv.id}
              className={
                'group relative rounded-md border transition-colors cursor-pointer ' +
                (isActive
                  ? 'bg-white border-stone-300 shadow-sm'
                  : 'bg-transparent border-transparent hover:bg-white hover:border-stone-200')
              }
              onClick={() => onSelect(inv.id)}
            >
              <div className="px-3 py-2.5 pr-9">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-stone-900 truncate">
                    {inv.invoiceNumber || 'Untitled'}
                  </span>
                  {isActive && dirty && (
                    <span
                      title="Unsaved changes"
                      className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"
                    />
                  )}
                </div>
                <div className="text-xs text-stone-500 truncate">
                  {inv.customerName || 'No customer'}
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-stone-400">{relativeTime(inv.updatedAt)}</span>
                  <span className="text-xs font-medium text-stone-600">
                    ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(inv.id);
                }}
                title="Delete invoice"
                className="absolute top-2 right-2 p-1.5 rounded text-stone-400 opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-50 transition"
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
