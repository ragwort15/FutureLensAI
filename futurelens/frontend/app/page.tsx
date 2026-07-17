"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import PageShell from "@/components/PageShell";
import { COUNTRIES } from "@/lib/countries";
import { loadSession } from "@/lib/session";
import { LIFE_STAGES, LifeStage, saveUserDetails } from "@/lib/userDetails";

export default function IntakePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");
  const [lifeStage, setLifeStage] = useState<LifeStage | "">("");

  useEffect(() => {
    if (!loadSession()) {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router]);

  const ageNum = Number(age);
  const ageValid = age.trim() !== "" && Number.isFinite(ageNum) && ageNum >= 18 && ageNum <= 120;
  const isValid = Boolean(
    name.trim() && ageValid && location.trim() && lifeStage,
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    saveUserDetails({
      name: name.trim(),
      age: age.trim(),
      location: location.trim(),
      lifeStage: lifeStage as LifeStage,
    });
    router.push("/clarify");
  }

  const inputClass =
    "w-full rounded-lg border border-line bg-white px-3.5 py-2.5 font-body text-ink placeholder:text-ink/40 transition focus:border-signal focus:outline-none focus:ring-2 focus:ring-signal/30";
  const labelClass = "mb-1.5 block font-body text-sm font-medium text-ink/80";

  if (!ready) return null;

  return (
    <PageShell step={1}>
      <div className="mb-8 text-center">
        <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl">
          Explore the future
          <br />
          <span className="text-signal">before you decide.</span>
        </h1>
        <p className="mt-3 font-body text-ink/60">
          A few details so we can personalize your scenarios.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full rounded-2xl border border-line bg-white/80 p-6 shadow-sm backdrop-blur-sm sm:p-8"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="name" className={labelClass}>Name</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
          </div>

          <div>
            <label htmlFor="age" className={labelClass}>Age</label>
            <input
              id="age"
              type="number"
              min="18"
              max="120"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
              className={inputClass}
            />
            {age.trim() !== "" && !ageValid && (
              <p className="mt-1 font-body text-xs text-ember">Age must be 18 or older.</p>
            )}
          </div>

          <div>
            <label htmlFor="location" className={labelClass}>Country</label>
            <select
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className={inputClass}
            >
              <option value="" disabled>Select one…</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="lifeStage" className={labelClass}>Life stage</label>
            <select
              id="lifeStage"
              value={lifeStage}
              onChange={(e) => setLifeStage(e.target.value as LifeStage)}
              required
              className={inputClass}
            >
              <option value="" disabled>Select one…</option>
              {LIFE_STAGES.map((stage) => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={!isValid}
            className="rounded-lg bg-signal px-6 py-3 font-body font-medium text-paper shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue →
          </button>
        </div>
      </form>
    </PageShell>
  );
}
