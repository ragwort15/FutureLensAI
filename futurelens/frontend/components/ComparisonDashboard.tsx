"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { AnalyzeResponse, UserDetails } from "@/lib/types";
import ScenarioCard from "./ScenarioCard";

interface Props {
  result: AnalyzeResponse;
  details: UserDetails;
}

export default function ComparisonDashboard({ result, details }: Props) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const chartData = result.scenarios.map((s) => ({
    name: s.title.length > 18 ? s.title.slice(0, 18) + "…" : s.title,
    score: Math.round(s.score),
  }));

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="rounded-lg border border-line bg-white px-4 py-3 font-body text-sm text-ink/70">
        <span className="font-medium text-ink">{details.name}</span>
        <span className="mx-2 text-ink/30">·</span>
        <span>{details.occupation}</span>
        <span className="mx-2 text-ink/30">·</span>
        <span>{details.location}</span>
        <span className="mx-2 text-ink/30">·</span>
        <span>{details.lifeStage}</span>
      </div>

      <div>
        <p className="mb-1 font-body text-xs font-medium uppercase tracking-wide text-ink/50">
          Your question
        </p>
        <p className="rounded-lg border border-line bg-white p-4 font-body text-ink">
          {result.decision}
        </p>
      </div>

      <div>
        <p className="mb-1 font-body text-xs font-medium uppercase tracking-wide text-ink/50">
          Summary
        </p>
        <p className="rounded-lg border border-line bg-white p-4 font-body leading-relaxed text-ink/80">
          {result.summary}
        </p>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="font-body text-xs font-medium uppercase tracking-wide text-ink/50">
            Score comparison
          </p>
          <button
            type="button"
            onClick={() => setShowBreakdown((v) => !v)}
            className="font-body text-xs text-signal underline decoration-signal/30 underline-offset-2 hover:decoration-signal"
          >
            {showBreakdown ? "Hide" : "How are scores calculated?"}
          </button>
        </div>

        {showBreakdown && (
          <div className="mb-4 rounded-lg border border-line bg-signal/5 p-4 font-body text-sm text-ink/70">
            <p className="mb-2">Each scenario is scored 0–100 based on:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Alignment with your stated goals and life stage</li>
              <li>Severity and likelihood of identified risks</li>
              <li>Strength and relevance of supporting evidence</li>
              <li>Reversibility — how easily this path could be changed later</li>
            </ul>
          </div>
        )}

        <div className="h-48 rounded-xl border border-line bg-white p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#DAD7CE" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#151726" }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#151726" }} />
              <Tooltip />
              <Bar dataKey="score" fill="#3D5A80" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {result.scenarios.map((scenario) => (
          <ScenarioCard key={scenario.title} scenario={scenario} />
        ))}
      </div>
    </div>
  );
}