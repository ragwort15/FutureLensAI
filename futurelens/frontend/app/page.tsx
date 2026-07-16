"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { LifeStage, saveUserDetails } from "@/lib/userDetails";

const LIFE_STAGES: LifeStage[] = ["Student", "Working", "Between roles", "Retired", "Other"];

export default function IntakePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [occupation, setOccupation] = useState("");
  const [location, setLocation] = useState("");
  const [lifeStage, setLifeStage] = useState<LifeStage | "">("");

  const isValid =
    name.trim() && age.trim() && occupation.trim() && location.trim() && lifeStage;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    saveUserDetails({
      name: name.trim(),
      age: age.trim(),
      occupation: occupation.trim(),
      location: location.trim(),
      lifeStage: lifeStage as LifeStage,
    });
    router.push("/analyze");
  }

  const inputClass =
    "w-full rounded-lg border border-line bg-white p-3 font-body text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-signal";
  const labelClass = "mb-1 block font-body text-sm text-ink/70";

  return (
    <main className="flex min-h-screen flex-col items-center px-6 py-16 bg-gradient-to-b from-paper to-signal/40">
      <div className="mb-10 text-center">
        <h1 className="font-display text-4xl text-ink">FutureLens</h1>
        <p className="mt-2 font-body text-ink/60">
          Explore the future before making your next big decision.
        </p>
      </div>

      <p className="mb-4 max-w-xl text-center font-body text-sm text-ink/50">
        We'll use this to personalize the scenarios we generate for you.
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-4">
        <div>
          <label htmlFor="name" className={labelClass}>Name</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
        </div>

        <div>
          <label htmlFor="age" className={labelClass}>Age</label>
          <input
            id="age"
            type="number"
            min="0"
            max="80"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="occupation" className={labelClass}>Occupation</label>
          <input
            id="occupation"
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="location" className={labelClass}>Location</label>
          <input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            className={inputClass}
          />
        </div>

        <div>
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

        <button
          type="submit"
          disabled={!isValid}
          className="mt-2 rounded-lg bg-signal px-6 py-3 font-body font-medium text-paper transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue
        </button>
      </form>
    </main>
  );
}
