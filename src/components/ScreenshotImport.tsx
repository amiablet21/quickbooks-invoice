import { useCallback, useEffect, useRef, useState } from 'react';
import { ScanLine, Loader2, CheckCircle2, AlertCircle, Upload } from 'lucide-react';
import { InvoiceData } from '../types';
import { parseWalmartText } from '../walmartParser';

interface ScreenshotImportProps {
  onApply: (patch: Partial<InvoiceData>) => void;
}

type Status = 'idle' | 'reading' | 'done' | 'empty' | 'error';

export default function ScreenshotImport({ onApply }: ScreenshotImportProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [filled, setFilled] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const desktop = Boolean(window.api?.scanImage);

  const runOcr = useCallback(
    async (dataUrl: string) => {
      if (!window.api?.scanImage) {
        setStatus('error');
        setError('Screenshot import is only available in the desktop app.');
        return;
      }
      setStatus('reading');
      setError('');
      setFilled([]);
      const res = await window.api.scanImage(dataUrl);
      if (!res.ok) {
        setStatus('error');
        setError(res.error || 'Could not read the image.');
        return;
      }
      const { patch, filled: got } = parseWalmartText(res.text || '');
      if (got.length === 0) {
        setStatus('empty');
        return;
      }
      onApply(patch);
      setFilled(got);
      setStatus('done');
    },
    [onApply]
  );

  const handleFile = useCallback(
    (file: File | null | undefined) => {
      if (!file || !file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => runOcr(String(reader.result));
      reader.readAsDataURL(file);
    },
    [runOcr]
  );

  // Accept Ctrl/Cmd+V image paste anywhere in the window.
  useEffect(() => {
    if (!desktop) return;
    const onPaste = (e: ClipboardEvent) => {
      const item = Array.from(e.clipboardData?.items ?? []).find((i) =>
        i.type.startsWith('image/')
      );
      if (item) {
        e.preventDefault();
        handleFile(item.getAsFile());
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [desktop, handleFile]);

  const busy = status === 'reading';

  return (
    <section className="mb-6">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      <div
        role="button"
        tabIndex={0}
        onClick={() => !busy && desktop && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !busy && desktop) inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (desktop) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (desktop) handleFile(e.dataTransfer.files?.[0]);
        }}
        className={
          'rounded-lg border-2 border-dashed px-5 py-6 text-center transition-colors select-none ' +
          (!desktop
            ? 'border-stone-200 bg-stone-50 cursor-not-allowed'
            : busy
              ? 'border-stone-300 bg-stone-50 cursor-wait'
              : dragOver
                ? 'border-stone-900 bg-stone-100 cursor-pointer'
                : 'border-stone-300 bg-stone-50 hover:border-stone-400 hover:bg-stone-100 cursor-pointer')
        }
      >
        {busy ? (
          <div className="flex flex-col items-center gap-2 text-stone-600">
            <Loader2 size={22} className="animate-spin" />
            <p className="text-sm font-medium">Reading screenshot…</p>
            <p className="text-xs text-stone-400">First scan takes a few seconds.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-9 h-9 rounded-full bg-stone-900 text-white flex items-center justify-center mb-1">
              <ScanLine size={18} />
            </div>
            <p className="text-sm font-medium text-stone-800">
              Import from Walmart screenshot
            </p>
            <p className="text-xs text-stone-500 flex items-center gap-1">
              <Upload size={12} />
              {desktop
                ? 'Click to choose, drag an image here, or paste (Ctrl+V)'
                : 'Available in the desktop app'}
            </p>
          </div>
        )}
      </div>

      {status === 'done' && (
        <div className="mt-3 flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Filled {filled.length} field{filled.length === 1 ? '' : 's'} — please review.</p>
            <p className="text-xs text-emerald-700 mt-0.5">{filled.join(', ')}</p>
          </div>
        </div>
      )}

      {status === 'empty' && (
        <div className="mt-3 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <p>
            Couldn't find order details in that image. Make sure the screenshot shows the full
            Walmart order page, or fill the fields in manually.
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-3 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}
    </section>
  );
}
