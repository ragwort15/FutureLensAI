import { ScenarioResult } from "@/lib/types";

export default function ScenarioCard({ scenario }: { scenario: ScenarioResult }) {
  return (
    <div className="flex flex-col rounded-xl border border-line bg-white p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="font-display text-lg leading-tight text-ink">{scenario.title}</h3>
        <span className="shrink-0 rounded-full bg-signal/10 px-2.5 py-1 font-body text-sm font-medium text-signal">
          {Math.round(scenario.score)}
        </span>
      </div>

      <p className="font-body text-sm leading-relaxed text-ink/80">{scenario.narrative}</p>

      {scenario.risks.length > 0 && (
        <div className="mt-4">
          <p className="font-body text-xs font-medium uppercase tracking-wide text-ember">Risks</p>
          <ul className="mt-1 space-y-1">
            {scenario.risks.map((risk) => (
              <li key={risk} className="font-body text-sm text-ink/70">
                · {risk}
              </li>
            ))}
          </ul>
        </div>
      )}

      {scenario.evidence.length > 0 && (
        <div className="mt-4 border-t border-line pt-3">
          <p className="font-body text-xs font-medium uppercase tracking-wide text-ink/50">Evidence</p>
          <ul className="mt-1 space-y-1">
            {scenario.evidence.map((e) => (
              <li key={e.url}>
                <a
                  href={e.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-body text-sm text-signal underline decoration-signal/30 underline-offset-2 hover:decoration-signal"
                >
                  {e.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
