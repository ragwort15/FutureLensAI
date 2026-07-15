"use client";

import { useState } from "react";

const EXAMPLES = [
  "Should I take a job offer in a new city or stay in my current role?",
  "Should our team migrate this service to a new framework this quarter?",
  "Should I go back to school full-time or study part-time while working?",
];

interface Props {
  onSubmit: (decision: string) => void;
  loading: boolean;
}

export default function DecisionForm({ onSubmit, loading }: Props) {
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim()) onSubmit(value.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <label htmlFor="decision" className="mb-2 block font-body text-sm text-ink/70">
        Describe the decision you're weighing
      </label>
      <textarea
        id="decision"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        placeholder="e.g. Should I take a job offer in a new city or stay in my current role?"
        className="w-full resize-none rounded-lg border border-line bg-white p-4 font-body text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-signal"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setValue(example)}
            className="rounded-full border border-line px-3 py-1 font-body text-xs text-ink/70 transition hover:border-signal hover:text-signal"
          >
            {example.length > 42 ? example.slice(0, 42) + "…" : example}
          </button>
        ))}
      </div>

      <button
        type="submit"
        disabled={loading || !value.trim()}
        className="mt-4 rounded-lg bg-signal px-6 py-3 font-body font-medium text-paper transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? "Simulating futures…" : "See three futures"}
      </button>
    </form>
  );
}
