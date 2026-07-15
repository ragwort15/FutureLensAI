import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { AnalyzeResponse } from "@/lib/types";
import ScenarioCard from "./ScenarioCard";

export default function ComparisonDashboard({ result }: { result: AnalyzeResponse }) {
  const chartData = result.scenarios.map((s) => ({
    name: s.title.length > 18 ? s.title.slice(0, 18) + "…" : s.title,
    score: Math.round(s.score),
  }));

  return (
    <div className="w-full max-w-5xl">
      <p className="mb-6 max-w-2xl font-body text-base leading-relaxed text-ink/80">{result.summary}</p>

      <div className="mb-8 h-48 rounded-xl border border-line bg-white p-4">
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {result.scenarios.map((scenario) => (
          <ScenarioCard key={scenario.title} scenario={scenario} />
        ))}
      </div>
    </div>
  );
}
