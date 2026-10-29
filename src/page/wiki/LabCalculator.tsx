"use client";
import { useState } from "react";
import { lab } from "@/lib/data/wiki";
import { labCost } from "@/lib/lab/cost";
export default function LabCalculator() {
  const [id, setId] = useState(lab[0].id);
  const [start, setStart] = useState("0");
  const [target, setTarget] = useState("1");
  const upgrade = lab.find((u) => u.id === id)!;
  const from = start === "" ? NaN : Number(start),
    to = target === "" ? NaN : Number(target);
  const total = labCost(upgrade, from, to);
  return (
    <div className="lab-calculator" id="calculator">
      <div>
        <span className="eyebrow">CURRENT LEVEL · TARGET LEVEL · TOTAL COST</span>
        <h2>Stardust Cost Calculator</h2>
        <p>Every level in between. One clear total.</p>
        <div className="lab-calculator-fields">
          <label className="field">
            Upgrade
            <select
              value={id}
              onChange={(e) => {
                setId(e.target.value);
                setStart("0");
                setTarget("1");
              }}
            >
              {lab.map((u) => (
                <option value={u.id} key={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Starting level
            <input
              type="number"
              min={0}
              max={upgrade.max - 1}
              step={1}
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </label>
          <label className="field">
            Target level
            <input
              type="number"
              min={1}
              max={upgrade.max}
              step={1}
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </label>
        </div>
        <p className="lab-calc-hint">
          {upgrade.desc} Maximum level: {upgrade.max}.
        </p>
      </div>
      <div className="lab-calculator-result" aria-live="polite">
        <span>REQUIRED STARDUST</span>
        <strong>
          {total === null ? "—" : `◆ ${total.toLocaleString("en-US")}`}
        </strong>
        <p>
          {total === null
            ? `Choose whole levels from 0 to ${upgrade.max}, with a target above your starting level.`
            : `${upgrade.name} · level ${from} → ${to}`}
        </p>
      </div>
      {total !== null ? (
        <details className="lab-cost-breakdown">
          <summary>See the cost for each level</summary>
          <ul>
            {upgrade.costsByLevel.slice(from, to).map((cost, i) => (
              <li key={i}>
                <span>
                  Level {from + i} → {from + i + 1}
                </span>
                <strong>◆ {cost.toLocaleString("en-US")}</strong>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}
