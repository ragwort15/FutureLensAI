"use client";

import { useState } from "react";

export interface ContextField {
  id: string;
  label: string;
  type?: "text" | "number";
  placeholder?: string;
}

// Placeholder set of fields. This will later be replaced by a form
// generated dynamically based on the user's decision.
const DEFAULT_FIELDS: ContextField[] = [
  { id: "salary", label: "Salary", type: "number", placeholder: "e.g. 85000" },
  { id: "experience", label: "Years of experience", type: "number", placeholder: "e.g. 5" },
  { id: "savings", label: "Savings", type: "number", placeholder: "e.g. 20000" },
  { id: "monthlyExpenses", label: "Monthly expenses", type: "number", placeholder: "e.g. 3000" },
];

interface Props {
  fields?: ContextField[];
  values?: Record<string, string>;
  onChange?: (values: Record<string, string>) => void;
}

export default function ContextForm({ fields = DEFAULT_FIELDS, values, onChange }: Props) {
  const [internalValues, setInternalValues] = useState<Record<string, string>>({});
  const currentValues = values ?? internalValues;

  function handleFieldChange(id: string, value: string) {
    const next = { ...currentValues, [id]: value };
    if (onChange) onChange(next);
    else setInternalValues(next);
  }

  const inputClass =
    "w-full rounded-lg border border-line bg-white p-3 font-body text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-signal";
  const labelClass = "mb-1 block font-body text-sm text-ink/70";

  return (
    <div className="mb-6 w-full max-w-2xl rounded-lg border border-line bg-white/60 p-4">
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}
      >
        {fields.map((field) => (
          <div key={field.id}>
            <label htmlFor={field.id} className={labelClass}>
              {field.label}
            </label>
            <input
              id={field.id}
              type={field.type ?? "text"}
              value={currentValues[field.id] ?? ""}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className={inputClass}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
