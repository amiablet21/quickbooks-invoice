import { useEffect, useState, useCallback, useRef, useLayoutEffect } from 'react';
import { Printer, Save, Check } from 'lucide-react';
import { InvoiceData, createBlankInvoice } from './types';
import { loadInvoices, saveInvoice, deleteInvoice } from './storage';
import Sidebar from './components/Sidebar';
import InvoiceEditor from './components/InvoiceEditor';
import InvoicePreview from './components/InvoicePreview';

// The invoice document is laid out at a fixed paper width. In a narrow window
// we scale the whole sheet down to fit the pane (Chromium `zoom`), so the full
// invoice is always visible without a horizontal scrollbar. Print resets to 1:1.
const SHEET_WIDTH = 816;

function PreviewPane({ invoice }: { invoice: InvoiceData }) {
  const paneRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  useLayoutEffect(() => {
    const el = paneRef.current;
    if (!el) return;
    const update = () => {
      const styles = getComputedStyle(el);
      const padding = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
      const avail = el.clientWidth - padding;
      setZoom(Math.min(1, avail / SHEET_WIDTH));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={paneRef}
      className="overflow-y-auto bg-stone-100 print:bg-white px-6 py-8 print:p-0"
    >
      <div className="preview-zoom" style={{ zoom }}>
        <InvoicePreview invoice={invoice} />
      </div>
    </div>
  );
}

function App() {
  const [invoices, setInvoices] = useState<InvoiceData[]>(() => loadInvoices());
  const [current, setCurrent] = useState<InvoiceData>(() => createBlankInvoice());
  const [dirty, setDirty] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const isSaved = invoices.some((i) => i.id === current.id);

  const update = useCallback((patch: Partial<InvoiceData>) => {
    setCurrent((prev) => ({ ...prev, ...patch }));
    setDirty(true);
    setJustSaved(false);
  }, []);

  const handleSave = useCallback(() => {
    setInvoices(saveInvoice(current));
    setDirty(false);
    setJustSaved(true);
  }, [current]);

  const confirmDiscard = useCallback(() => {
    if (!dirty) return true;
    return window.confirm('You have unsaved changes. Discard them?');
  }, [dirty]);

  const handleNew = useCallback(() => {
    if (!confirmDiscard()) return;
    setCurrent(createBlankInvoice());
    setDirty(false);
    setJustSaved(false);
  }, [confirmDiscard]);

  const handleSelect = useCallback(
    (id: string) => {
      if (id === current.id) return;
      if (!confirmDiscard()) return;
      const found = invoices.find((i) => i.id === id);
      if (found) {
        setCurrent(found);
        setDirty(false);
        setJustSaved(false);
      }
    },
    [invoices, current.id, confirmDiscard]
  );

  const handleDelete = useCallback(
    (id: string) => {
      if (!window.confirm('Delete this invoice permanently?')) return;
      const next = deleteInvoice(id);
      setInvoices(next);
      if (id === current.id) {
        setCurrent(createBlankInvoice());
        setDirty(false);
        setJustSaved(false);
      }
    },
    [current.id]
  );

  // Ctrl/Cmd+S to save
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleSave]);

  return (
    <div className="flex h-screen bg-stone-100 text-stone-900">
      <div className="print:hidden">
        <Sidebar
          invoices={invoices}
          activeId={current.id}
          dirty={dirty}
          onNew={handleNew}
          onSelect={handleSelect}
          onDelete={handleDelete}
        />
      </div>

      <main className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <header className="print:hidden shrink-0 h-16 px-6 flex items-center justify-between bg-white/80 backdrop-blur border-b border-stone-200">
          <div className="min-w-0">
            <h1 className="text-sm font-medium text-stone-900 truncate">
              {current.invoiceNumber || 'New Invoice'}
            </h1>
            <p className="text-xs text-stone-400">
              {isSaved ? (dirty ? 'Unsaved changes' : 'Saved') : 'Not saved yet'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-stone-700 border border-stone-300 rounded-md hover:bg-stone-50 transition-colors"
            >
              <Printer size={16} />
              Print / PDF
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-stone-900 rounded-md hover:bg-stone-700 transition-colors"
            >
              {justSaved && !dirty ? <Check size={16} /> : <Save size={16} />}
              {justSaved && !dirty ? 'Saved' : 'Save'}
            </button>
          </div>
        </header>

        {/* Content: editor + preview. Side-by-side from ~800px up (the window's
            min width is 900), so a normal window keeps the preview beside the
            editor instead of stacking it far below. */}
        <div className="flex-1 min-h-0 grid grid-cols-1 min-[800px]:grid-cols-[minmax(360px,420px)_1fr]">
          <div className="print:hidden overflow-y-auto border-r border-stone-200 bg-white px-6 py-6">
            <InvoiceEditor invoice={current} onChange={update} />
          </div>
          <PreviewPane invoice={current} />
        </div>
      </main>
    </div>
  );
}

export default App;
