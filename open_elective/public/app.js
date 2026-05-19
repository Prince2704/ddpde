import { criteria, scenarios } from "./data.js";
import { evaluateDecision, getDefaultWeights } from "./engine.js";

const STORAGE_KEY = "atlas-decision-engine-state-v1";
const AUDIT_KEY = "atlas-decision-engine-audit-v1";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 1,
  minimumFractionDigits: 1
});

const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1
});

const dom = {
  form: document.querySelector("#decision-form"),
  weightsGrid: document.querySelector("#weights-grid"),
  runButton: document.querySelector("#run-analysis"),
  exportButton: document.querySelector("#export-report"),
  health: document.querySelector("#engine-health"),
  snapshotCards: document.querySelector("#snapshot-cards"),
  portfolioList: document.querySelector("#portfolio-list"),
  decisionSummary: document.querySelector("#decision-summary"),
  driversChart: document.querySelector("#drivers-chart"),
  scenarioTable: document.querySelector("#scenario-table"),
  governancePanel: document.querySelector("#governance-panel"),
  monitoringPanel: document.querySelector("#monitoring-panel"),
  auditPanel: document.querySelector("#audit-panel")
};

let latestEvaluation = null;
let auditTrail = loadPersistedAudit();

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatMoney(value) {
  return currencyFormatter.format(value).replace(".0", "") + "M";
}

function formatScore(value) {
  return `${percentFormatter.format(value)}/100`;
}

function formatTimestamp(date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function loadPersistedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_error) {
    return null;
  }
}

function persistState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (_error) {
    return;
  }
}

function loadPersistedAudit() {
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_error) {
    return [];
  }
}

function persistAudit() {
  try {
    localStorage.setItem(AUDIT_KEY, JSON.stringify(auditTrail));
  } catch (_error) {
    return;
  }
}

function renderWeightControls(weights) {
  dom.weightsGrid.innerHTML = criteria
    .map(
      (criterion) => `
        <div class="weight-row">
          <label for="weight-${criterion.key}">${escapeHtml(criterion.label)}</label>
          <input
            id="weight-${criterion.key}"
            name="weight-${criterion.key}"
            type="range"
            min="2"
            max="30"
            step="1"
            value="${weights[criterion.key]}"
            aria-describedby="weight-value-${criterion.key}"
          />
          <span id="weight-value-${criterion.key}" class="weight-value">${weights[criterion.key]}</span>
        </div>
      `
    )
    .join("");

  criteria.forEach((criterion) => {
    const input = dom.form.querySelector(`#weight-${criterion.key}`);
    const output = dom.form.querySelector(`#weight-value-${criterion.key}`);

    input.addEventListener("input", () => {
      output.textContent = input.value;
    });
  });
}

function applySavedState() {
  const saved = loadPersistedState();
  const weights = saved?.weights || getDefaultWeights();

  dom.form.elements.decisionTitle.value = saved?.decisionTitle || "FY27 Growth Allocation Review";
  dom.form.elements.objective.value =
    saved?.objective ||
    "Prioritize the initiative with the best balance of ROI, speed, strategic fit, and controlled delivery risk.";
  dom.form.elements.budgetCap.value = saved?.budgetCap || 12;
  dom.form.elements.timeHorizon.value = saved?.timeHorizon || 18;
  dom.form.elements.riskTolerance.value = saved?.riskTolerance || "balanced";
  dom.form.elements.scenario.value = saved?.scenario || "base";

  renderWeightControls(weights);
}

function getFormState() {
  const weights = criteria.reduce((result, criterion) => {
    result[criterion.key] = Number(dom.form.elements[`weight-${criterion.key}`].value);
    return result;
  }, {});

  return {
    decisionTitle: dom.form.elements.decisionTitle.value.trim() || "Untitled Decision",
    objective: dom.form.elements.objective.value.trim() || "No objective provided.",
    budgetCap: Number(dom.form.elements.budgetCap.value) || 12,
    timeHorizon: Number(dom.form.elements.timeHorizon.value) || 18,
    riskTolerance: dom.form.elements.riskTolerance.value,
    scenario: dom.form.elements.scenario.value,
    weights
  };
}

function renderSnapshot(result) {
  const cards = [
    { label: "Leading Option", value: result.snapshot.leadOption, note: result.recommendedOption.owner },
    { label: "Approval Signal", value: result.snapshot.approvalSignal, note: result.recommendedOption.explanation },
    { label: "Portfolio Average", value: formatScore(result.snapshot.averageScore), note: "Weighted portfolio score" },
    {
      label: "Active Alerts",
      value: String(result.snapshot.criticalAlerts),
      note: result.snapshot.criticalAlerts ? "Warnings or blockers detected" : "No active issues"
    }
  ];

  dom.snapshotCards.innerHTML = cards
    .map(
      (card) => `
        <div class="metric-card">
          <span class="metric-label">${escapeHtml(card.label)}</span>
          <strong>${escapeHtml(card.value)}</strong>
          <p>${escapeHtml(card.note)}</p>
        </div>
      `
    )
    .join("");

  dom.health.textContent = result.health;
}

function renderPortfolio(rankedPortfolio) {
  dom.portfolioList.innerHTML = rankedPortfolio
    .map((option) => {
      const badges = [
        `<span class="pill ${option.recommendationTone}">${escapeHtml(option.recommendation)}</span>`,
        `<span class="pill">#${option.rank} ranked</span>`,
        `<span class="pill">${escapeHtml(option.theme)}</span>`
      ];

      option.guardrails.forEach((guardrail) => {
        badges.push(
          `<span class="pill ${guardrail.severity === "block" ? "bad" : "warn"}">${escapeHtml(
            guardrail.label
          )}</span>`
        );
      });

      return `
        <article class="option-card">
          <div class="option-topline">
            <div>
              <span class="mini-label">${escapeHtml(option.owner)}</span>
              <h3>${escapeHtml(option.name)}</h3>
            </div>
            <div class="score-meta">
              <strong>${formatScore(option.score)}</strong>
              <span class="mini-label">Composite score</span>
            </div>
          </div>
          <p>${escapeHtml(option.summary)}</p>
          <div class="option-kpis">
            <div class="mini-kpi">
              <span class="mini-label">Expected Value</span>
              <strong>${formatMoney(option.netValue)}</strong>
            </div>
            <div class="mini-kpi">
              <span class="mini-label">Cost</span>
              <strong>${formatMoney(option.cost)}</strong>
            </div>
            <div class="mini-kpi">
              <span class="mini-label">Confidence</span>
              <strong>${formatScore(option.confidence)}</strong>
            </div>
            <div class="mini-kpi">
              <span class="mini-label">Success Probability</span>
              <strong>${percentFormatter.format(option.successProbability)}%</strong>
            </div>
          </div>
          <div>
            <div class="score-meta">
              <span class="mini-label">Score strength</span>
              <span class="mini-label">Risk ${percentFormatter.format(option.riskIndex)}</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" style="width:${option.score}%;"></div>
            </div>
          </div>
          <div class="option-flags">${badges.join("")}</div>
          <p>${escapeHtml(option.explanation)}</p>
        </article>
      `;
    })
    .join("");
}

function renderDecisionSummary(result) {
  const challenger = result.rankedPortfolio[1];
  const weightLeaders = Object.entries(result.effectiveWeights)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([key, value]) => {
      const criterion = criteria.find((item) => item.key === key);
      return `${criterion.label} ${value}%`;
    });

  dom.decisionSummary.innerHTML = `
    <article class="summary-card recommended">
      <span class="mini-label">${escapeHtml(result.inputs.decisionTitle)}</span>
      <h3>${escapeHtml(result.recommendedOption.name)}</h3>
      <p>${escapeHtml(result.recommendedOption.explanation)}</p>
      <div class="summary-metrics">
        <span>Recommendation: <strong>${escapeHtml(result.recommendedOption.recommendation)}</strong></span>
        <span>Payback: <strong>${escapeHtml(String(result.recommendedOption.payback))} months</strong></span>
        <span>Annual benefit: <strong>${formatMoney(result.recommendedOption.annualBenefit)}</strong></span>
      </div>
      <div class="pill-row">
        ${result.recommendedOption.positiveDrivers
          .map((driver) => `<span class="pill good">${escapeHtml(driver.label)}</span>`)
          .join("")}
      </div>
    </article>
    <article class="summary-card">
      <span class="mini-label">Closest Challenger</span>
      <h3>${escapeHtml(challenger.name)}</h3>
      <p>${escapeHtml(challenger.explanation)}</p>
      <div class="summary-metrics">
        <span>Score: <strong>${formatScore(challenger.score)}</strong></span>
        <span>Gap to lead: <strong>${percentFormatter.format(result.recommendedOption.score - challenger.score)}</strong></span>
        <span>Risk: <strong>${percentFormatter.format(challenger.riskIndex)}</strong></span>
      </div>
      <div class="pill-row">
        ${challenger.riskDrivers
          .map((driver) => `<span class="pill warn">${escapeHtml(driver.label)}</span>`)
          .join("")}
      </div>
    </article>
    <article class="summary-card">
      <span class="mini-label">Decision Posture</span>
      <h3>${escapeHtml(scenarios[result.inputs.scenario].label)}</h3>
      <p>${escapeHtml(scenarios[result.inputs.scenario].narrative)}</p>
      <div class="summary-metrics">
        <span>Budget cap: <strong>${formatMoney(result.inputs.budgetCap)}</strong></span>
        <span>Horizon: <strong>${escapeHtml(String(result.inputs.timeHorizon))} months</strong></span>
        <span>Risk posture: <strong>${escapeHtml(result.inputs.riskTolerance)}</strong></span>
      </div>
      <div class="pill-row">
        ${weightLeaders.map((item) => `<span class="pill">${escapeHtml(item)}</span>`).join("")}
      </div>
    </article>
  `;
}

function renderDrivers(result) {
  const drivers = [...result.recommendedOption.contributions]
    .sort((left, right) => Math.abs(right.gap) - Math.abs(left.gap))
    .slice(0, 6);
  const maxGap = Math.max(...drivers.map((driver) => Math.abs(driver.gap)), 1);

  dom.driversChart.innerHTML = drivers
    .map((driver) => {
      const width = (Math.abs(driver.gap) / maxGap) * 100;
      const tone = driver.gap >= 0 ? "var(--accent)" : "var(--danger)";
      const descriptor = driver.gap >= 0 ? "Supports ranking" : "Needs mitigation";

      return `
        <div class="driver-row">
          <div class="driver-top">
            <div>
              <strong>${escapeHtml(driver.label)}</strong>
              <p>${escapeHtml(driver.description)}</p>
            </div>
            <div class="driver-strength">${escapeHtml(descriptor)} | ${percentFormatter.format(driver.weight)}%</div>
          </div>
          <div class="bar-track">
            <div class="bar-fill" style="width:${width}%; background:${tone};"></div>
          </div>
          <div class="score-meta">
            <span class="mini-label">Observed: ${percentFormatter.format(driver.rawMetric)}</span>
            <span class="mini-label">Contribution: ${percentFormatter.format(driver.contribution)}</span>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderScenarioTable(result) {
  const scenarioOrder = Object.keys(scenarios);
  const rows = [...result.scenarioMatrix].sort(
    (left, right) => left.scenarioResults[result.inputs.scenario].rank - right.scenarioResults[result.inputs.scenario].rank
  );

  dom.scenarioTable.innerHTML = `
    <div class="scenario-table-card">
      <table>
        <thead>
          <tr>
            <th>Option</th>
            ${scenarioOrder
              .map((scenarioKey) => `<th>${escapeHtml(scenarios[scenarioKey].label)}</th>`)
              .join("")}
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) => `
                <tr>
                  <td>${escapeHtml(row.name)}</td>
                  ${scenarioOrder
                    .map((scenarioKey) => {
                      const cell = row.scenarioResults[scenarioKey];
                      const background =
                        scenarioKey === result.inputs.scenario ? "rgba(77, 208, 168, 0.08)" : "transparent";

                      return `
                        <td style="background:${background};">
                          <span class="rank-badge">${cell.rank}</span>
                          ${formatScore(cell.score)}
                        </td>
                      `;
                    })
                    .join("")}
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderGovernance(result) {
  const cards = result.governance.cards
    .map(
      (card) => `
        <article class="governance-card">
          <div class="score-meta">
            <span class="mini-label">${escapeHtml(card.title)}</span>
            <span class="pill ${card.tone}">${escapeHtml(card.value)}</span>
          </div>
          <p>${escapeHtml(card.description)}</p>
        </article>
      `
    )
    .join("");

  const notes = `
    <article class="governance-card">
      <span class="mini-label">Decision notes</span>
      <h3>Model governance context</h3>
      <div class="pill-row">
        ${result.governance.notes.map((note) => `<span class="pill">${escapeHtml(note)}</span>`).join("")}
      </div>
    </article>
  `;

  dom.governancePanel.innerHTML = cards + notes;
}

function renderMonitoring(result) {
  dom.monitoringPanel.innerHTML = result.monitoring
    .map(
      (item) => `
        <article class="monitor-card">
          <div class="monitor-line">
            <div>
              <span class="mini-label">${escapeHtml(item.statusLabel)}</span>
              <h3>${escapeHtml(item.label)}</h3>
            </div>
            <span class="delta ${item.tone}">
              ${item.variance >= 0 ? "+" : ""}${escapeHtml(String(item.variance))}${escapeHtml(item.unit)}
            </span>
          </div>
          <p>${escapeHtml(item.narrative)}</p>
          <div class="summary-metrics">
            <span>Current: <strong>${escapeHtml(String(item.current))}${escapeHtml(item.unit)}</strong></span>
            <span>Target: <strong>${escapeHtml(String(item.target))}${escapeHtml(item.unit)}</strong></span>
          </div>
        </article>
      `
    )
    .join("");
}

function renderAudit() {
  if (!auditTrail.length) {
    dom.auditPanel.innerHTML = `
      <article class="audit-event">
        <div class="audit-head">
          <strong>No events yet</strong>
          <time>Waiting</time>
        </div>
        <p>The audit trail will capture each recalculation with scenario, leader, and approval signal.</p>
      </article>
    `;
    return;
  }

  dom.auditPanel.innerHTML = auditTrail
    .map(
      (item) => `
        <article class="audit-event">
          <div class="audit-head">
            <strong>${escapeHtml(item.title)}</strong>
            <time>${escapeHtml(item.timestamp)}</time>
          </div>
          <p>${escapeHtml(item.detail)}</p>
        </article>
      `
    )
    .join("");
}

function recordAudit(result) {
  auditTrail = [
    {
      title: `${result.inputs.decisionTitle} recalculated`,
      timestamp: formatTimestamp(new Date()),
      detail: `${scenarios[result.inputs.scenario].label} selected. ${result.recommendedOption.name} ranked #1 with ${result.recommendedOption.recommendation} status at ${formatScore(result.recommendedOption.score)}.`
    },
    ...auditTrail
  ].slice(0, 6);

  persistAudit();
}

function renderAll(result) {
  renderSnapshot(result);
  renderPortfolio(result.rankedPortfolio);
  renderDecisionSummary(result);
  renderDrivers(result);
  renderScenarioTable(result);
  renderGovernance(result);
  renderMonitoring(result);
  renderAudit();
}

function runEvaluation({ writeAudit } = { writeAudit: true }) {
  const state = getFormState();
  persistState(state);
  latestEvaluation = evaluateDecision(state);

  if (writeAudit) {
    recordAudit(latestEvaluation);
  }

  renderAll(latestEvaluation);
}

function exportReport() {
  if (!latestEvaluation) {
    runEvaluation({ writeAudit: true });
  }

  const report = {
    generatedAt: new Date().toISOString(),
    title: latestEvaluation.inputs.decisionTitle,
    objective: latestEvaluation.inputs.objective,
    scenario: scenarios[latestEvaluation.inputs.scenario].label,
    riskTolerance: latestEvaluation.inputs.riskTolerance,
    recommendedOption: {
      name: latestEvaluation.recommendedOption.name,
      owner: latestEvaluation.recommendedOption.owner,
      recommendation: latestEvaluation.recommendedOption.recommendation,
      score: latestEvaluation.recommendedOption.score,
      confidence: latestEvaluation.recommendedOption.confidence,
      successProbability: latestEvaluation.recommendedOption.successProbability,
      netValueMn: latestEvaluation.recommendedOption.netValue,
      explanation: latestEvaluation.recommendedOption.explanation,
      guardrails: latestEvaluation.recommendedOption.guardrails
    },
    portfolio: latestEvaluation.rankedPortfolio.map((item) => ({
      rank: item.rank,
      name: item.name,
      score: item.score,
      recommendation: item.recommendation,
      netValueMn: item.netValue,
      riskIndex: item.riskIndex
    })),
    monitoring: latestEvaluation.monitoring,
    governance: latestEvaluation.governance
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safeName = latestEvaluation.inputs.decisionTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  link.href = url;
  link.download = `${safeName || "decision-report"}.json`;
  link.click();

  URL.revokeObjectURL(url);
}

function bindEvents() {
  dom.form.addEventListener("submit", (event) => {
    event.preventDefault();
    runEvaluation({ writeAudit: true });
  });

  dom.runButton.addEventListener("click", () => {
    runEvaluation({ writeAudit: true });
  });

  dom.exportButton.addEventListener("click", exportReport);

  dom.form.elements.scenario.addEventListener("change", () => runEvaluation({ writeAudit: true }));
  dom.form.elements.riskTolerance.addEventListener("change", () => runEvaluation({ writeAudit: true }));

  ["budgetCap", "timeHorizon"].forEach((field) => {
    dom.form.elements[field].addEventListener("change", () => runEvaluation({ writeAudit: true }));
  });

  criteria.forEach((criterion) => {
    dom.form.elements[`weight-${criterion.key}`].addEventListener("change", () => runEvaluation({ writeAudit: true }));
  });
}

function init() {
  applySavedState();
  bindEvents();
  renderAudit();
  runEvaluation({ writeAudit: false });
}

init();
