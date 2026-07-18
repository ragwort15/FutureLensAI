"use client";

import { jsPDF } from "jspdf";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { loadAnalysisResult, savePrefillDecision } from "@/lib/analysisResult";
import { AnalyzeResponse } from "@/lib/types";
import { UserDetails, loadUserDetails } from "@/lib/userDetails";

const cardClass =
  "rounded-2xl border border-line bg-white/90 shadow-sm backdrop-blur-sm transition-shadow duration-200 hover:shadow-md";

// Fixed categorical order (CVD-validated) — cycles if a decision has more
// factors than colors. Never reassign a color by rank; always by label index.
const FACTOR_COLORS = [
  "#2a78d6", // blue
  "#008300", // green
  "#e87ba4", // magenta
  "#eda100", // yellow
  "#1baf7a", // aqua
  "#eb6834", // orange
  "#4a3aa7", // violet
  "#e34948", // red
];

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 flex items-center gap-2 font-body text-xs font-medium uppercase tracking-wide text-ink/50">
      <span className="h-1.5 w-1.5 rounded-full bg-signal" aria-hidden="true" />
      {children}
    </p>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [details, setDetails] = useState<UserDetails | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [customQuestions, setCustomQuestions] = useState<string[]>([]);
  const [customQuestionInput, setCustomQuestionInput] = useState("");

  useEffect(() => {
    const d = loadUserDetails();
    if (!d) {
      router.replace("/");
      return;
    }
    const r = loadAnalysisResult();
    if (!r) {
      router.replace("/analyze");
      return;
    }
    setDetails(d);
    setResult(r);
  }, [router]);

  function askThis(question: string) {
    savePrefillDecision(question);
    router.push("/analyze");
  }

  function handleAddCustomQuestion(e: React.FormEvent) {
    e.preventDefault();
    const question = customQuestionInput.trim();
    if (!question) return;
    setCustomQuestions((prev) => [...prev, question]);
    setCustomQuestionInput("");
  }

  async function loadLogoDataUrl(): Promise<string | null> {
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new window.Image();
        el.onload = () => resolve(el);
        el.onerror = reject;
        el.src = "/logo.png";
      });
      // Source logo.png is ~1MB at full resolution — downscale to a small
      // canvas first so the embedded PDF image stays a few KB, not megabytes.
      const size = 96;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.drawImage(img, 0, 0, size, size);
      return canvas.toDataURL("image/png");
    } catch {
      return null;
    }
  }

  async function handleDownload() {
    if (!result || !details) return;

    const logoDataUrl = await loadLogoDataUrl();

    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const marginX = 54;
    const marginTop = 60;
    const marginBottom = 60;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - marginX * 2;
    let y = marginTop;

    function ensureSpace(needed: number) {
      if (y + needed > pageHeight - marginBottom) {
        doc.addPage();
        y = marginTop;
      }
    }

    function writeParagraph(text: string, options: { size?: number; bold?: boolean; color?: [number, number, number]; gap?: number; leading?: number } = {}) {
      const size = options.size ?? 11;
      const leading = options.leading ?? size * 1.4;
      const gap = options.gap ?? 6;
      doc.setFont("helvetica", options.bold ? "bold" : "normal");
      doc.setFontSize(size);
      doc.setTextColor(...(options.color ?? [21, 23, 38]));
      const lines = doc.splitTextToSize(text, contentWidth) as string[];
      for (const line of lines) {
        ensureSpace(leading);
        doc.text(line, marginX, y);
        y += leading;
      }
      y += gap;
    }

    function writeHeading(text: string, size = 14) {
      ensureSpace(size * 1.6);
      writeParagraph(text, { size, bold: true, color: [61, 90, 128], gap: 4 });
    }

    function writeDivider() {
      ensureSpace(12);
      doc.setDrawColor(218, 215, 206);
      doc.line(marginX, y, marginX + contentWidth, y);
      y += 12;
    }

    const titleSize = 22;
    const titleLeading = titleSize * 1.4;
    const logoSize = 24;
    ensureSpace(titleLeading);
    if (logoDataUrl) {
      doc.addImage(logoDataUrl, "PNG", marginX, y - titleSize * 0.8, logoSize, logoSize);
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(titleSize);
    doc.setTextColor(21, 23, 38);
    doc.text("The Future Lens", marginX + (logoDataUrl ? logoSize + 8 : 0), y);
    y += titleLeading + 2;
    writeParagraph(`Analysis for ${details.name}`, { size: 11, color: [90, 90, 100], gap: 2 });
    writeParagraph(
      `${details.lifeStage} · ${details.location}`,
      { size: 10, color: [120, 120, 130], gap: 12 },
    );
    writeDivider();

    writeHeading("Question");
    writeParagraph(result.decision, { gap: 14 });

    writeHeading("Summary");
    writeParagraph(result.summary, { gap: 14 });

    writeHeading("Score comparison");

    const chartRows = hasBreakdown
      ? breakdownChartData.map((row) => ({
          name: String(row.name),
          bars: breakdownFactorLabels.map((label) => ({
            value: Number(row[label] ?? 0),
            rgb: hexToRgb(factorColor(label)),
          })),
        }))
      : chartData.map((row) => ({
          name: row.name,
          bars: [{ value: row.score, rgb: hexToRgb("#3D5A80") }],
        }));

    const barsPerGroup = chartRows[0]?.bars.length ?? 1;
    const chartH = 120;
    const legendRows = hasBreakdown ? Math.ceil(breakdownFactorLabels.length / 4) : 0;
    ensureSpace(chartH + 40 + legendRows * 14 + 10);

    const chartX = marginX;
    const chartY = y;
    const chartW = contentWidth;
    const baselineY = chartY + chartH;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 130);
    for (const step of [0, 25, 50, 75, 100]) {
      const gridY = baselineY - (step / 100) * chartH;
      if (step > 0) {
        doc.setDrawColor(230, 228, 220);
        doc.setLineWidth(0.4);
        doc.line(chartX, gridY, chartX + chartW, gridY);
      }
      doc.text(String(step), chartX - 4, gridY + 2, { align: "right" });
    }
    doc.setDrawColor(61, 90, 128);
    doc.setLineWidth(0.75);
    doc.line(chartX, baselineY, chartX + chartW, baselineY);

    const slotWidth = chartW / chartRows.length;
    const barsAreaWidth = slotWidth * 0.7;
    const slotOffset = slotWidth * 0.15;
    const barGap = 2;
    const barWidth = (barsAreaWidth - barGap * (barsPerGroup - 1)) / barsPerGroup;

    chartRows.forEach((row, i) => {
      const groupX0 = chartX + i * slotWidth + slotOffset;
      row.bars.forEach((bar, j) => {
        const barH = Math.max((bar.value / 100) * chartH, 0.01);
        const barX = groupX0 + j * (barWidth + barGap);
        const barY = baselineY - barH;
        const radius = Math.min(1.2, barWidth / 2, barH / 2);
        doc.setFillColor(bar.rgb[0], bar.rgb[1], bar.rgb[2]);
        doc.roundedRect(barX, barY, barWidth, barH, radius, radius, "F");
      });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(21, 23, 38);
      doc.text(row.name, chartX + i * slotWidth + slotWidth / 2, baselineY + 12, { align: "center" });
    });

    y = baselineY + 22;

    if (hasBreakdown) {
      let lx = chartX;
      let ly = y;
      for (const label of breakdownFactorLabels) {
        const [r, g, b] = hexToRgb(factorColor(label));
        doc.setFillColor(r, g, b);
        doc.circle(lx + 2, ly - 2, 2, "F");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(21, 23, 38);
        const textW = doc.getTextWidth(label);
        doc.text(label, lx + 6, ly);
        lx += 6 + textW + 14;
        if (lx > chartX + contentWidth - 60) {
          lx = chartX;
          ly += 12;
        }
      }
      y = ly + 18;
    } else {
      y += 6;
    }

    writeHeading("Scenarios");
    for (const s of result.scenarios) {
      writeParagraph(`${s.title}  —  score ${Math.round(s.score)}/100`, { bold: true, size: 12, gap: 4 });
      writeParagraph(s.narrative, { gap: 6 });
      if (s.risks.length > 0) {
        writeParagraph("Risks", { bold: true, size: 10, color: [238, 150, 75], gap: 2 });
        for (const r of s.risks) writeParagraph(`•  ${r}`, { size: 10, gap: 2 });
      }
      if (s.evidence && s.evidence.length > 0) {
        writeParagraph("Evidence", { bold: true, size: 10, color: [90, 90, 100], gap: 2 });
        for (const e of s.evidence) writeParagraph(`•  ${e.title} — ${e.url}`, { size: 9, color: [90, 90, 100], gap: 2 });
      }
      y += 6;
    }

    if (result.assumptions && result.assumptions.length > 0) {
      writeHeading("Assumptions");
      for (const a of result.assumptions) writeParagraph(`•  ${a}`, { gap: 2 });
    }

    const safeName = details.name.replace(/\s+/g, "-").toLowerCase() || "report";
    doc.save(`futurelens-${safeName}.pdf`);
  }

  if (!details || !result) return null;

  const chartData = result.scenarios.map((s) => ({
    name: s.title.length > 18 ? s.title.slice(0, 18) + "…" : s.title,
    score: Math.round(s.score),
  }));

  const hasBreakdown =
    result.scenarios.length > 0 &&
    result.scenarios.every((s) => s.scoreBreakdown && s.scoreBreakdown.length > 0);

  const breakdownFactorLabels = hasBreakdown
    ? Array.from(new Set(result.scenarios.flatMap((s) => (s.scoreBreakdown ?? []).map((f) => f.label))))
    : [];

  const breakdownChartData = hasBreakdown
    ? result.scenarios.map((s) => {
        const row: Record<string, string | number> = {
          name: s.title.length > 18 ? s.title.slice(0, 18) + "…" : s.title,
        };
        for (const factor of s.scoreBreakdown ?? []) {
          row[factor.label] = Math.round(factor.value);
        }
        return row;
      })
    : [];

  function factorColor(label: string) {
    const idx = breakdownFactorLabels.indexOf(label);
    return FACTOR_COLORS[idx % FACTOR_COLORS.length];
  }

  const initials = details.name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <main className="relative flex min-h-screen justify-center overflow-hidden bg-gradient-to-b from-paper via-paper to-signal/20 px-8 py-10">
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-signal/20 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-5xl space-y-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 transition hover:opacity-80">
            <span className="relative block h-10 w-10 shrink-0 overflow-hidden rounded-md bg-ink">
              <Image src="/logo.png" alt="" fill sizes="40px" className="object-contain p-0.5" />
            </span>
            <h1 className="font-display text-4xl text-ink">The Future Lens</h1>
          </Link>

          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-2 rounded-full bg-ember px-5 py-2.5 font-body text-sm font-semibold text-ink shadow-lg shadow-ember/40 ring-2 ring-ember/30 transition hover:scale-105 hover:shadow-xl hover:shadow-ember/50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M10 2a1 1 0 0 1 1 1v8.586l2.293-2.293a1 1 0 0 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 1 1 1.414-1.414L9 11.586V3a1 1 0 0 1 1-1Z" />
              <path d="M4 15a1 1 0 0 1 1 1v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1a1 1 0 1 1 2 0v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-1a1 1 0 0 1 1-1Z" />
            </svg>
            Download your report
          </button>
        </div>

        <div>
          <SectionLabel>Your question</SectionLabel>
          <p className={`${cardClass} border-l-4 border-l-signal p-4 font-body text-ink`}>
            {result.decision}
          </p>
        </div>

        <div>
          <SectionLabel>Summary</SectionLabel>
          <p className={`${cardClass} p-4 font-body leading-relaxed text-ink/80`}>
            {result.summary}
          </p>
        </div>

        <div>
          <SectionLabel>Score comparison</SectionLabel>
          <div className={`${cardClass} p-4`}>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                {hasBreakdown ? (
                  <BarChart
                    data={breakdownChartData}
                    margin={{ top: 8, right: 16, left: -16, bottom: 0 }}
                    barGap={4}
                    barCategoryGap="20%"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#DAD7CE" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#151726" }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#151726" }} />
                    <Tooltip />
                    {breakdownFactorLabels.map((label) => (
                      <Bar key={label} dataKey={label} name={label} fill={factorColor(label)} radius={[4, 4, 0, 0]} />
                    ))}
                  </BarChart>
                ) : (
                  <BarChart data={chartData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#DAD7CE" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#151726" }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#151726" }} />
                    <Tooltip />
                    <Bar dataKey="score" fill="#3D5A80" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>

            {hasBreakdown && (
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-line pt-3">
                {breakdownFactorLabels.map((label) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: factorColor(label) }}
                      aria-hidden="true"
                    />
                    <span className="font-body text-xs text-ink/70">{label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {result.scenarios.map((scenario) => (
            <div
              key={scenario.title}
              className={`${cardClass} group flex flex-col overflow-hidden transition-transform duration-200 hover:-translate-y-1`}
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-signal to-ember/70" />

              <div className="flex flex-col p-5">
                <div className="mb-4 text-center">
                  <span className="font-display text-5xl font-semibold text-signal transition-transform duration-200 group-hover:scale-105">
                    {Math.round(scenario.score)}
                  </span>
                  <p className="mt-1 font-body text-xs font-medium uppercase tracking-wide text-ink/50">
                    Score
                  </p>
                </div>

                <h3 className="mb-2 text-center font-display text-lg leading-tight text-ink">
                  {scenario.title}
                </h3>

                <p className="font-body text-sm leading-relaxed text-ink/80">
                  {scenario.narrative}
                </p>

                {scenario.risks.length > 0 && (
                  <div className="mt-4">
                    <p className="font-body text-xs font-medium uppercase tracking-wide text-ember">
                      Risks
                    </p>
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
                    <p className="font-body text-xs font-medium uppercase tracking-wide text-ink/50">
                      Evidence
                    </p>
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
            </div>
          ))}
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-line to-transparent" />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-stretch">
          <div className="flex flex-col">
            <SectionLabel>Assumptions</SectionLabel>
            {result.assumptions && result.assumptions.length > 0 ? (
              <ul className={`${cardClass} flex-1 space-y-2 p-4`}>
                {result.assumptions.map((assumption) => (
                  <li key={assumption} className="font-body text-sm text-ink/80">
                    · {assumption}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={`${cardClass} flex-1 p-4 font-body text-sm text-ink/50`}>
                No assumptions were provided for this analysis.
              </p>
            )}
          </div>

          <div className={`${cardClass} flex flex-col p-5`}>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-signal font-display text-sm font-semibold text-paper">
                {initials}
              </div>
              <p className="font-body text-xs font-medium uppercase tracking-wide text-ink/50">
                Your profile
              </p>
            </div>
            <dl className="space-y-3">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <dt className="font-body text-sm text-ink/60">Name</dt>
                <dd className="font-body text-sm font-medium text-ink">{details.name}</dd>
              </div>
              <div className="flex items-center justify-between border-b border-line pb-3">
                <dt className="font-body text-sm text-ink/60">Age</dt>
                <dd className="font-body text-sm font-medium text-ink">{details.age}</dd>
              </div>
              <div className="flex items-center justify-between border-b border-line pb-3">
                <dt className="font-body text-sm text-ink/60">Life stage</dt>
                <dd className="font-body text-sm font-medium text-ink">{details.lifeStage}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="font-body text-sm text-ink/60">Country</dt>
                <dd className="font-body text-sm font-medium text-ink">{details.location}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div>
          <SectionLabel>Suggested next questions</SectionLabel>

          {[...(result.nextQuestions ?? []), ...customQuestions].length > 0 ? (
            <ul className="space-y-3">
              {[...(result.nextQuestions ?? []), ...customQuestions].map((question) => (
                <li
                  key={question}
                  className={`${cardClass} flex items-center justify-between gap-4 p-4`}
                >
                  <span className="font-body text-sm text-ink/80">{question}</span>
                  <button
                    type="button"
                    onClick={() => askThis(question)}
                    className="shrink-0 rounded-lg border border-signal px-3 py-1.5 font-body text-xs font-medium text-signal transition hover:bg-signal hover:text-paper"
                  >
                    Ask this
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className={`${cardClass} p-4 font-body text-sm text-ink/50`}>
              No follow-up questions yet — add your own below.
            </p>
          )}

          <form onSubmit={handleAddCustomQuestion} className="mt-3 flex gap-2">
            <input
              value={customQuestionInput}
              onChange={(e) => setCustomQuestionInput(e.target.value)}
              placeholder="Add your own question…"
              className="flex-1 rounded-lg border border-line bg-white p-2.5 font-body text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-signal"
            />
            <button
              type="submit"
              disabled={!customQuestionInput.trim()}
              className="shrink-0 rounded-lg bg-signal px-4 py-2 font-body text-sm font-medium text-paper transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Add
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
