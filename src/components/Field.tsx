import { ReactNode } from 'react';

interface FieldProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export function Field({ label, children, className = '' }: FieldProps) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-[11px] font-medium uppercase tracking-wider text-stone-500 mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClasses =
  'w-full px-3 py-2 bg-white border border-stone-300 rounded-md text-sm text-stone-900 ' +
  'placeholder:text-stone-400 transition-colors ' +
  'focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900';

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  className,
}: TextFieldProps) {
  return (
    <Field label={label} className={className}>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputClasses}
      />
    </Field>
  );
}

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: string;
  className?: string;
}

export function NumberField({ label, value, onChange, step, className }: NumberFieldProps) {
  return (
    <Field label={label} className={className}>
      <input
        type="number"
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className={inputClasses}
      />
    </Field>
  );
}

interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  className?: string;
}

export function TextAreaField({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
  className,
}: TextAreaFieldProps) {
  return (
    <Field label={label} className={className}>
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClasses} resize-y leading-relaxed`}
      />
    </Field>
  );
}

interface ReadOnlyFieldProps {
  label: string;
  value: string;
  emphasis?: boolean;
  className?: string;
}

export function ReadOnlyField({ label, value, emphasis, className }: ReadOnlyFieldProps) {
  return (
    <Field label={label} className={className}>
      <div
        className={
          'w-full px-3 py-2 rounded-md text-sm border ' +
          (emphasis
            ? 'bg-stone-900 text-white border-stone-900 font-semibold'
            : 'bg-stone-100 text-stone-600 border-stone-200')
        }
      >
        {value}
      </div>
    </Field>
  );
}
