import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const control =
  "w-full rounded-xl border bg-white px-4 py-3 text-[0.95rem] text-ink placeholder:text-muted/60 transition-[border-color,box-shadow] duration-200 focus:outline-none focus:ring-4 disabled:opacity-60";
const controlState = (invalid: boolean) =>
  invalid ? "border-red-700/60 focus:border-red-700 focus:ring-red-700/10" : "border-line focus:border-gold focus:ring-gold/15";

type FieldProps = {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: (props: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
};

export function Field({ label, error, hint, required, className, children }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-ink">
        {label}
        {required ? (
          <span className="text-gold-dark" aria-hidden>
            {" "}
            *
          </span>
        ) : (
          <span className="font-normal text-muted"> (optional)</span>
        )}
      </label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint && !error ? (
        <p id={hintId} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="mt-1.5 text-xs font-medium text-red-800">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type ControlProps = { invalid?: boolean; describedBy?: string };

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & ControlProps>(
  function Input({ invalid = false, describedBy, className, ...props }, ref) {
    return (
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className={cn(control, controlState(invalid), className)}
        {...props}
      />
    );
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & ControlProps>(
  function Textarea({ invalid = false, describedBy, className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        rows={5}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className={cn(control, controlState(invalid), "resize-y", className)}
        {...props}
      />
    );
  },
);

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & ControlProps & { options: readonly { value: string; label: string }[]; placeholder?: string }
>(function Select({ invalid = false, describedBy, className, options, placeholder = "Select an option", ...props }, ref) {
  return (
    <div className="relative">
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className={cn(control, controlState(invalid), "appearance-none pr-10", className)}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
    </div>
  );
});

export const Checkbox = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { label: ReactNode; error?: string }
>(function Checkbox({ label, error, ...props }, ref) {
  const id = useId();
  return (
    <div>
      <div className="flex items-start gap-3">
        <input
          ref={ref}
          id={id}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-line accent-forest"
          {...props}
        />
        <label htmlFor={id} className="cursor-pointer text-sm leading-relaxed text-muted">
          {label}
        </label>
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 pl-8 text-xs font-medium text-red-800">
          {error}
        </p>
      ) : null}
    </div>
  );
});

/** Hidden from people, tempting to bots. Must stay empty. */
export const Honeypot = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Honeypot(props, ref) {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Leave this field empty
        <input ref={ref} type="text" tabIndex={-1} autoComplete="off" {...props} />
      </label>
    </div>
  );
});
