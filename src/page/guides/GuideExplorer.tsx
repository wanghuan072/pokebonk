"use client";
import { useState } from "react";
import { guides } from "@/lib/data/editorial";
import GuideCard from "@/components/content/GuideCard";
export default function GuideExplorer() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const categories = [...new Set(guides.map((g) => g.category))];
  const shown = guides.filter(
    (g) =>
      (g.title + " " + g.summary).toLowerCase().includes(q.toLowerCase()) &&
      (cat === "all" || g.category === cat),
  );
  return (
    <>
      <div className="page-toolbar">
        <label className="field">
          Find a guide
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="What would you like to learn?"
          />
        </label>
        <label className="field">
          Category
          <select value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="all">All guides</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <button
          className="button"
          onClick={() => {
            setQ("");
            setCat("all");
          }}
        >
          Reset Filters
        </button>
      </div>
      <p className="result-count" role="status">
        {shown.length} guides to explore
      </p>
      <div className="guides-grid">
        {shown.map((g) => (
          <GuideCard guide={g} key={g.slug} />
        ))}
      </div>
      {!shown.length ? (
        <div className="empty-state">
          <h2>No guide found</h2>
          <p>Try another topic or choose all guides.</p>
        </div>
      ) : null}
    </>
  );
}
