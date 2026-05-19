import { criteria, portfolioOptions, scenarios } from "./data.js";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const round = (value, digits = 1) => Number(value.toFixed(digits));

export function getDefaultWeights() {
  return criteria.reduce((weights, criterion) => {
    weights[criterion.key] = criterion.defaultWeight;
    return weights;
  }, {});
}

export function buildEffectiveWeights(rawWeights, riskTolerance) {
  const adjusted = criteria.reduce((weights, criterion) => {
    let multiplier = 1;

    if (riskTolerance === "conservative") {
      if (criterion.key === "dataConfidence") multiplier = 1.12;
      if (criterion.key === "executionRisk" || criterion.key === "complianceRisk") multiplier = 1.25;
      if (criterion.key === "roi" || criterion.key === "timeToValue") multiplier = 0.88;
    }

    if (riskTolerance === "aggressive") {
      if (criterion.key === "roi" || criterion.key === "customerImpact" || criterion.key === "timeToValue") multiplier = 1.12;
      if (criterion.key === "executionRisk" || criterion.key === "complianceRisk") multiplier = 0.85;
    }

    weights[criterion.key] = Math.max(rawWeights[criterion.key] || 0, 1) * multiplier;
    return weights;
  }, {});

  return normalizeWeights(adjusted);
}

export function normalizeWeights(weights) {
  const total = Object.values(weights).reduce((sum, value) => sum + value, 0) || 1;

  return Object.entries(weights).reduce((normalized, [key, value]) => {
    normalized[key] = round((value / total) * 100, 1);
    return normalized;
  }, {});
}

function getThresholds(riskTolerance) {
  if (riskTolerance === "conservative") {
    return {
      executionRisk: 68,
      complianceRisk: 44,
      dataConfidence: 62,
      paybackGraceMultiplier: 1.0
    };
  }

  if (riskTolerance === "aggressive") {
    return {
      executionRisk: 82,
      complianceRisk: 58,
      dataConfidence: 52,
      paybackGraceMultiplier: 1.3
    };
  }

  return {
    executionRisk: 75,
    complianceRisk: 50,
    dataConfidence: 57,
    paybackGraceMultiplier: 1.15
  };
}

function evaluateOption(option, inputs, weights, scenarioKey) {
  const scenario = scenarios[scenarioKey];
  const scenarioOffsets = option.scenarioOffsets?.[scenarioKey] || {};
  const financialOffsets = option.financialOffsets?.[scenarioKey] || {};
  const horizonYears = clamp(inputs.timeHorizon / 12, 1, 3);
  const thresholds = getThresholds(inputs.riskTolerance);

  const metrics = criteria.reduce((result, criterion) => {
    const base = option.baseMetrics[criterion.key] || 50;
    const globalDelta = scenario.metricAdjustments[criterion.key] || 0;
    const localDelta = scenarioOffsets[criterion.key] || 0;
    result[criterion.key] = clamp(base + globalDelta + localDelta, 5, 98);
    return result;
  }, {});

  const cost = round(option.baseCostMn * scenario.costMultiplier * (financialOffsets.costMultiplier || 1), 1);
  const annualBenefit = round(
    option.annualBenefitMn * scenario.valueMultiplier * (financialOffsets.benefitMultiplier || 1),
    1
  );
  const payback = round(
    option.paybackMonths * scenario.timelineMultiplier * (financialOffsets.timelineMultiplier || 1),
    1
  );
  const netValue = round(annualBenefit * horizonYears - cost, 1);

  const contributions = criteria.map((criterion) => {
    const rawMetric = metrics[criterion.key];
    const effectiveMetric = criterion.direction === "negative" ? 100 - rawMetric : rawMetric;
    const contribution = round((effectiveMetric * weights[criterion.key]) / 100, 2);
    const gap = round((((effectiveMetric - 50) / 50) * weights[criterion.key]) / 2, 2);

    return {
      key: criterion.key,
      label: criterion.label,
      direction: criterion.direction,
      rawMetric,
      effectiveMetric,
      weight: weights[criterion.key],
      contribution,
      gap,
      description: criterion.description
    };
  });

  const score = round(contributions.reduce((sum, item) => sum + item.contribution, 0), 1);
  const riskIndex = round(metrics.executionRisk * 0.6 + metrics.complianceRisk * 0.4, 1);
  const confidence = round(clamp(metrics.dataConfidence * 0.52 + (100 - riskIndex) * 0.18 + score * 0.3, 0, 100), 1);
  const successProbability = round(clamp(score * 0.54 + confidence * 0.24 + (100 - riskIndex) * 0.22, 0, 100), 1);

  const guardrails = [];

  if (cost > inputs.budgetCap * 1.05) {
    guardrails.push({
      severity: "block",
      label: "Budget overrun",
      message: `Estimated cost of $${cost}M exceeds the budget cap by more than 5%.`
    });
  } else if (cost > inputs.budgetCap) {
    guardrails.push({
      severity: "warn",
      label: "Budget pressure",
      message: `Estimated cost of $${cost}M is above the budget cap and needs a funding exception.`
    });
  }

  if (metrics.executionRisk > thresholds.executionRisk) {
    guardrails.push({
      severity: metrics.executionRisk > thresholds.executionRisk + 8 ? "block" : "warn",
      label: "Execution exposure",
      message: `Execution risk is elevated at ${metrics.executionRisk}/100 for the selected risk posture.`
    });
  }

  if (metrics.complianceRisk > thresholds.complianceRisk) {
    guardrails.push({
      severity: metrics.complianceRisk > thresholds.complianceRisk + 6 ? "block" : "warn",
      label: "Compliance exposure",
      message: `Compliance risk is ${metrics.complianceRisk}/100 and requires structured review.`
    });
  }

  if (metrics.dataConfidence < thresholds.dataConfidence) {
    guardrails.push({
      severity: "warn",
      label: "Evidence quality",
      message: `Data confidence is ${metrics.dataConfidence}/100, below the preferred minimum for this posture.`
    });
  }

  if (payback > inputs.timeHorizon * thresholds.paybackGraceMultiplier) {
    guardrails.push({
      severity: payback > inputs.timeHorizon * (thresholds.paybackGraceMultiplier + 0.15) ? "block" : "warn",
      label: "Slow payback",
      message: `Payback of ${payback} months extends beyond the active decision horizon.`
    });
  }

  const blockers = guardrails.filter((guardrail) => guardrail.severity === "block").length;
  const warnings = guardrails.filter((guardrail) => guardrail.severity === "warn").length;

  let recommendation = "Watchlist";
  let recommendationTone = "warn";

  if (!blockers && score >= 80 && confidence >= 74 && riskIndex <= 45) {
    recommendation = "Approve";
    recommendationTone = "good";
  } else if (!blockers && score >= 72 && confidence >= 68) {
    recommendation = "Pilot";
    recommendationTone = "good";
  } else if (blockers) {
    recommendation = "Hold";
    recommendationTone = "bad";
  } else if (score < 64 || confidence < 60) {
    recommendation = "Defer";
    recommendationTone = "bad";
  }

  const positiveDrivers = [...contributions].sort((a, b) => b.gap - a.gap).slice(0, 2);
  const riskDrivers = [...contributions].sort((a, b) => a.gap - b.gap).slice(0, 2);

  return {
    ...option,
    metrics,
    cost,
    annualBenefit,
    payback,
    netValue,
    score,
    riskIndex,
    confidence,
    successProbability,
    contributions,
    guardrails,
    blockers,
    warnings,
    recommendation,
    recommendationTone,
    positiveDrivers,
    riskDrivers,
    explanation: buildExplanation(option, recommendation, positiveDrivers, riskDrivers, guardrails)
  };
}

function buildExplanation(option, recommendation, positiveDrivers, riskDrivers, guardrails) {
  const lead = positiveDrivers[0]?.label || "Portfolio fit";
  const second = positiveDrivers[1]?.label || "Data confidence";
  const riskLead = riskDrivers[0]?.label || "Execution risk";

  if (guardrails.some((item) => item.severity === "block")) {
    return `${option.name} shows promise on ${lead.toLowerCase()} and ${second.toLowerCase()}, but it is currently blocked by ${riskLead.toLowerCase()} or commercial guardrails.`;
  }

  if (recommendation === "Approve") {
    return `${option.name} leads because it combines strong ${lead.toLowerCase()} with above-market ${second.toLowerCase()} while keeping downside manageable.`;
  }

  if (recommendation === "Pilot") {
    return `${option.name} is attractive enough to advance, but a phased rollout is safer while validating ${riskLead.toLowerCase()} assumptions.`;
  }

  return `${option.name} remains viable, but the evidence suggests more diligence is needed around ${riskLead.toLowerCase()} before committing at scale.`;
}

function evaluatePortfolio(inputs, scenarioKey, weights) {
  return portfolioOptions
    .map((option) => evaluateOption(option, inputs, weights, scenarioKey))
    .sort((left, right) => right.score - left.score)
    .map((option, index) => ({ ...option, rank: index + 1 }));
}

function buildScenarioMatrix(inputs, weights) {
  const rankingsByScenario = Object.keys(scenarios).reduce((result, scenarioKey) => {
    result[scenarioKey] = evaluatePortfolio(inputs, scenarioKey, weights);
    return result;
  }, {});

  return portfolioOptions.map((option) => {
    const scenarioResults = Object.keys(scenarios).reduce((result, scenarioKey) => {
      const row = rankingsByScenario[scenarioKey].find((item) => item.id === option.id);
      result[scenarioKey] = {
        rank: row.rank,
        score: row.score,
        recommendation: row.recommendation
      };
      return result;
    }, {});

    return {
      id: option.id,
      name: option.name,
      scenarioResults
    };
  });
}

function buildGovernance(inputs, effectiveWeights, rankedPortfolio, recommendedOption) {
  const maxWeight = Math.max(...Object.values(effectiveWeights));
  const weightConcentration = round(maxWeight, 1);
  const totalWarnings = rankedPortfolio.reduce((sum, item) => sum + item.warnings, 0);
  const totalBlockers = rankedPortfolio.reduce((sum, item) => sum + item.blockers, 0);
  const coverage = round(
    rankedPortfolio.reduce((sum, item) => sum + item.metrics.dataConfidence, 0) / rankedPortfolio.length,
    1
  );
  const freshestSource = Math.min(...rankedPortfolio.map((item) => item.dataFreshnessDays));
  const approvalRoute =
    recommendedOption.cost >= 10
      ? ["Business sponsor", "Finance", "COO", "Executive committee"]
      : ["Business sponsor", "Finance", "COO"];

  const guardrailHighlights = recommendedOption.guardrails.length
    ? recommendedOption.guardrails
    : [
        {
          severity: "good",
          label: "No hard blockers",
          message: "The leading option clears mandatory budget, timing, and compliance gates."
        }
      ];

  return {
    coverage,
    freshestSource,
    weightConcentration,
    totalWarnings,
    totalBlockers,
    approvalRoute,
    cards: [
      {
        title: "Approval path",
        tone: "good",
        value: recommendedOption.recommendation,
        description: `Recommended route: ${approvalRoute.join(" -> ")}. Budgeted cost is $${recommendedOption.cost}M.`
      },
      {
        title: "Guardrail status",
        tone: totalBlockers ? "bad" : totalWarnings ? "warn" : "good",
        value: totalBlockers ? `${totalBlockers} blockers` : totalWarnings ? `${totalWarnings} warnings` : "Clear",
        description: guardrailHighlights.map((item) => item.label).join(", ")
      },
      {
        title: "Evidence quality",
        tone: coverage >= 75 ? "good" : coverage >= 65 ? "warn" : "bad",
        value: `${coverage}%`,
        description: `Average data confidence across the portfolio. Freshest source landed ${freshestSource} day(s) ago.`
      },
      {
        title: "Weight discipline",
        tone: weightConcentration <= 24 ? "good" : weightConcentration <= 30 ? "warn" : "bad",
        value: `${weightConcentration}%`,
        description: `Largest normalized weight share after risk posture adjustments. Helps detect single-factor bias.`
      }
    ],
    notes: [
      `Decision objective: ${inputs.objective}`,
      `Scenario in force: ${scenarios[inputs.scenario].label}.`,
      `Risk posture: ${inputs.riskTolerance}. Hard guardrails remain active regardless of score.`
    ]
  };
}

function buildMonitoring(option, scenarioKey) {
  return option.monitoring.map((item) => {
    const deltaValue = item.direction === "up" ? item.current - item.target : item.target - item.current;
    const variance = round(deltaValue, 1);
    const healthy = variance >= 0;
    const near = variance > -Math.abs(item.target * 0.08);
    const tone = healthy ? "good" : near ? "warn" : "bad";

    return {
      ...item,
      tone,
      variance,
      statusLabel: healthy ? "On track" : near ? "Watch" : "Escalate",
      narrative: `Under ${scenarios[scenarioKey].label.toLowerCase()}, ${item.label.toLowerCase()} is ${
        healthy ? "tracking to target" : near ? "slightly off plan" : "materially behind target"
      }.`
    };
  });
}

export function evaluateDecision(inputs) {
  const effectiveWeights = buildEffectiveWeights(inputs.weights, inputs.riskTolerance);
  const rankedPortfolio = evaluatePortfolio(inputs, inputs.scenario, effectiveWeights);
  const recommendedOption = rankedPortfolio[0];
  const scenarioMatrix = buildScenarioMatrix(inputs, effectiveWeights);
  const governance = buildGovernance(inputs, effectiveWeights, rankedPortfolio, recommendedOption);
  const monitoring = buildMonitoring(recommendedOption, inputs.scenario);
  const averageScore = round(rankedPortfolio.reduce((sum, item) => sum + item.score, 0) / rankedPortfolio.length, 1);
  const health =
    governance.totalBlockers > 0
      ? "Guardrails active"
      : governance.totalWarnings > 0
        ? "Monitor closely"
        : "Ready";

  return {
    inputs,
    effectiveWeights,
    rankedPortfolio,
    recommendedOption,
    scenarioMatrix,
    governance,
    monitoring,
    health,
    snapshot: {
      leadOption: recommendedOption.name,
      averageScore,
      approvalSignal: recommendedOption.recommendation,
      criticalAlerts: governance.totalBlockers + governance.totalWarnings
    }
  };
}
