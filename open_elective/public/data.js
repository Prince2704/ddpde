export const criteria = [
  {
    key: "roi",
    label: "Financial Return",
    direction: "positive",
    defaultWeight: 18,
    description: "Net value creation across the decision horizon."
  },
  {
    key: "strategicFit",
    label: "Strategic Fit",
    direction: "positive",
    defaultWeight: 16,
    description: "Alignment to enterprise priorities and differentiation."
  },
  {
    key: "customerImpact",
    label: "Customer Impact",
    direction: "positive",
    defaultWeight: 14,
    description: "Expected effect on retention, adoption, or satisfaction."
  },
  {
    key: "timeToValue",
    label: "Time to Value",
    direction: "positive",
    defaultWeight: 12,
    description: "How quickly the initiative produces measurable outcomes."
  },
  {
    key: "operationalFit",
    label: "Operational Fit",
    direction: "positive",
    defaultWeight: 12,
    description: "Compatibility with processes, systems, and capacity."
  },
  {
    key: "dataConfidence",
    label: "Data Confidence",
    direction: "positive",
    defaultWeight: 10,
    description: "Reliability and completeness of the underlying evidence."
  },
  {
    key: "executionRisk",
    label: "Execution Risk",
    direction: "negative",
    defaultWeight: 10,
    description: "Delivery complexity, dependencies, and change burden."
  },
  {
    key: "complianceRisk",
    label: "Compliance Risk",
    direction: "negative",
    defaultWeight: 8,
    description: "Regulatory, privacy, legal, or policy exposure."
  }
];

export const scenarios = {
  base: {
    label: "Base Case",
    narrative: "Current assumptions hold with moderate macro conditions and stable internal capacity.",
    valueMultiplier: 1,
    costMultiplier: 1,
    timelineMultiplier: 1,
    metricAdjustments: {}
  },
  expansion: {
    label: "Expansion",
    narrative: "Demand expands and growth bets gain leverage, but scaling pressure increases execution load.",
    valueMultiplier: 1.18,
    costMultiplier: 1.06,
    timelineMultiplier: 0.94,
    metricAdjustments: {
      roi: 6,
      strategicFit: 2,
      customerImpact: 5,
      executionRisk: 3
    }
  },
  downturn: {
    label: "Downturn",
    narrative: "Capital discipline tightens, savings matter more, and implementation delays become more likely.",
    valueMultiplier: 0.82,
    costMultiplier: 1.04,
    timelineMultiplier: 1.1,
    metricAdjustments: {
      roi: -12,
      customerImpact: -5,
      timeToValue: -4,
      executionRisk: 8,
      complianceRisk: 4,
      dataConfidence: 2
    }
  },
  disruption: {
    label: "Disruption",
    narrative: "Operating volatility rises, resilience and adaptability matter more than straight-line planning.",
    valueMultiplier: 0.93,
    costMultiplier: 1.12,
    timelineMultiplier: 1.2,
    metricAdjustments: {
      strategicFit: 4,
      timeToValue: -8,
      operationalFit: -6,
      dataConfidence: -7,
      executionRisk: 12,
      complianceRisk: 6
    }
  }
};

export const portfolioOptions = [
  {
    id: "ai-forecast-copilot",
    name: "AI Forecast Copilot",
    owner: "Revenue Operations",
    theme: "Margin Growth",
    summary: "Improve commercial planning with pipeline intelligence, pricing signals, and forecast guidance.",
    baseCostMn: 6.4,
    annualBenefitMn: 8.8,
    paybackMonths: 11,
    dataFreshnessDays: 3,
    sources: ["CRM pipeline", "ERP orders", "discount logs", "planning models"],
    baseMetrics: {
      roi: 84,
      strategicFit: 88,
      customerImpact: 72,
      timeToValue: 76,
      operationalFit: 81,
      dataConfidence: 79,
      executionRisk: 42,
      complianceRisk: 28
    },
    scenarioOffsets: {
      expansion: { roi: 5, customerImpact: 4, executionRisk: 3 },
      downturn: { roi: -6, customerImpact: -4, operationalFit: -1 },
      disruption: { strategicFit: 2, dataConfidence: -8, executionRisk: 9 }
    },
    financialOffsets: {
      expansion: { benefitMultiplier: 1.12 },
      downturn: { benefitMultiplier: 0.9, timelineMultiplier: 1.08 },
      disruption: { costMultiplier: 1.08, benefitMultiplier: 0.95, timelineMultiplier: 1.12 }
    },
    monitoring: [
      { label: "Forecast accuracy", target: 88, current: 86, unit: "%", direction: "up" },
      { label: "Gross margin uplift", target: 2.8, current: 2.1, unit: "pts", direction: "up" },
      { label: "Planner adoption", target: 75, current: 68, unit: "%", direction: "up" }
    ]
  },
  {
    id: "warehouse-automation",
    name: "Warehouse Automation",
    owner: "Operations",
    theme: "Cost Efficiency",
    summary: "Automate picking and replenishment decisions to reduce handling time and improve fulfillment reliability.",
    baseCostMn: 11.2,
    annualBenefitMn: 10.1,
    paybackMonths: 15,
    dataFreshnessDays: 5,
    sources: ["WMS events", "labor telemetry", "order history"],
    baseMetrics: {
      roi: 78,
      strategicFit: 74,
      customerImpact: 64,
      timeToValue: 58,
      operationalFit: 90,
      dataConfidence: 83,
      executionRisk: 55,
      complianceRisk: 24
    },
    scenarioOffsets: {
      expansion: { roi: 4, operationalFit: 3, executionRisk: 2 },
      downturn: { roi: -8, timeToValue: -4, operationalFit: -2 },
      disruption: { customerImpact: 2, executionRisk: 10, complianceRisk: 2 }
    },
    financialOffsets: {
      expansion: { benefitMultiplier: 1.06 },
      downturn: { benefitMultiplier: 0.88, timelineMultiplier: 1.15 },
      disruption: { costMultiplier: 1.1, timelineMultiplier: 1.18 }
    },
    monitoring: [
      { label: "Units per labor hour", target: 128, current: 119, unit: "", direction: "up" },
      { label: "Fulfillment SLA attainment", target: 97, current: 95, unit: "%", direction: "up" },
      { label: "Safety incidents", target: 0.9, current: 1.2, unit: "/mo", direction: "down" }
    ]
  },
  {
    id: "dynamic-pricing-optimizer",
    name: "Dynamic Pricing Optimizer",
    owner: "Commercial Excellence",
    theme: "Revenue Acceleration",
    summary: "Continuously adjust list and discount recommendations using elasticity, inventory, and segment behavior.",
    baseCostMn: 7.8,
    annualBenefitMn: 12.4,
    paybackMonths: 9,
    dataFreshnessDays: 2,
    sources: ["price history", "win-loss records", "inventory signals", "competitor tracking"],
    baseMetrics: {
      roi: 92,
      strategicFit: 82,
      customerImpact: 69,
      timeToValue: 71,
      operationalFit: 68,
      dataConfidence: 74,
      executionRisk: 61,
      complianceRisk: 46
    },
    scenarioOffsets: {
      expansion: { roi: 8, customerImpact: 3, executionRisk: 4 },
      downturn: { strategicFit: 2, customerImpact: -7, complianceRisk: 5 },
      disruption: { dataConfidence: -10, executionRisk: 11, complianceRisk: 8 }
    },
    financialOffsets: {
      expansion: { benefitMultiplier: 1.16 },
      downturn: { benefitMultiplier: 0.84 },
      disruption: { costMultiplier: 1.06, benefitMultiplier: 0.89 }
    },
    monitoring: [
      { label: "Margin lift", target: 3.4, current: 2.7, unit: "pts", direction: "up" },
      { label: "Offer acceptance", target: 64, current: 60, unit: "%", direction: "up" },
      { label: "Pricing override rate", target: 12, current: 16, unit: "%", direction: "down" }
    ]
  },
  {
    id: "regional-expansion",
    name: "Regional Market Expansion",
    owner: "Strategy & Sales",
    theme: "Growth Platform",
    summary: "Launch a focused go-to-market expansion in a high-growth adjacent region with localized operations.",
    baseCostMn: 12.8,
    annualBenefitMn: 14.9,
    paybackMonths: 20,
    dataFreshnessDays: 14,
    sources: ["market scans", "partner interviews", "channel models"],
    baseMetrics: {
      roi: 80,
      strategicFit: 90,
      customerImpact: 83,
      timeToValue: 44,
      operationalFit: 51,
      dataConfidence: 66,
      executionRisk: 70,
      complianceRisk: 35
    },
    scenarioOffsets: {
      expansion: { roi: 6, customerImpact: 5, executionRisk: 2 },
      downturn: { roi: -15, timeToValue: -6, executionRisk: 7, complianceRisk: 3 },
      disruption: { strategicFit: 5, operationalFit: -8, dataConfidence: -6, executionRisk: 12 }
    },
    financialOffsets: {
      expansion: { benefitMultiplier: 1.18 },
      downturn: { benefitMultiplier: 0.76, timelineMultiplier: 1.2 },
      disruption: { costMultiplier: 1.12, timelineMultiplier: 1.16 }
    },
    monitoring: [
      { label: "Pipeline creation", target: 7.5, current: 6.1, unit: "Mn", direction: "up" },
      { label: "Partner activation", target: 18, current: 15, unit: "", direction: "up" },
      { label: "Regulatory exceptions", target: 1, current: 2, unit: "", direction: "down" }
    ]
  },
  {
    id: "support-automation-studio",
    name: "Support Automation Studio",
    owner: "Customer Operations",
    theme: "Experience at Scale",
    summary: "Automate tier-one support workflows with knowledge orchestration, routing intelligence, and guided resolution.",
    baseCostMn: 4.1,
    annualBenefitMn: 5.7,
    paybackMonths: 8,
    dataFreshnessDays: 1,
    sources: ["ticket logs", "knowledge base", "workforce rosters", "QA audits"],
    baseMetrics: {
      roi: 76,
      strategicFit: 72,
      customerImpact: 88,
      timeToValue: 85,
      operationalFit: 74,
      dataConfidence: 71,
      executionRisk: 38,
      complianceRisk: 33
    },
    scenarioOffsets: {
      expansion: { customerImpact: 6, timeToValue: 2 },
      downturn: { roi: -4, operationalFit: 1 },
      disruption: { operationalFit: -3, dataConfidence: -5, executionRisk: 7 }
    },
    financialOffsets: {
      expansion: { benefitMultiplier: 1.1 },
      downturn: { benefitMultiplier: 0.91 },
      disruption: { costMultiplier: 1.05, timelineMultiplier: 1.08 }
    },
    monitoring: [
      { label: "First-contact resolution", target: 78, current: 74, unit: "%", direction: "up" },
      { label: "Average handle time", target: 6.5, current: 7.2, unit: "min", direction: "down" },
      { label: "CSAT", target: 4.6, current: 4.4, unit: "/5", direction: "up" }
    ]
  },
  {
    id: "supplier-control-tower",
    name: "Supplier Risk Control Tower",
    owner: "Procurement",
    theme: "Resilience",
    summary: "Unify supplier health, risk events, and inventory dependencies to improve sourcing decisions and contingency plans.",
    baseCostMn: 5.6,
    annualBenefitMn: 7.3,
    paybackMonths: 10,
    dataFreshnessDays: 4,
    sources: ["supplier scorecards", "shipment telemetry", "inventory buffers", "risk feeds"],
    baseMetrics: {
      roi: 75,
      strategicFit: 84,
      customerImpact: 58,
      timeToValue: 68,
      operationalFit: 78,
      dataConfidence: 82,
      executionRisk: 44,
      complianceRisk: 20
    },
    scenarioOffsets: {
      expansion: { strategicFit: 1, customerImpact: 1 },
      downturn: { strategicFit: 4, operationalFit: 3, roi: 1 },
      disruption: { strategicFit: 7, customerImpact: 6, executionRisk: 4 }
    },
    financialOffsets: {
      expansion: { benefitMultiplier: 1.02 },
      downturn: { benefitMultiplier: 1.04 },
      disruption: { benefitMultiplier: 1.1, costMultiplier: 1.04 }
    },
    monitoring: [
      { label: "Critical supplier coverage", target: 92, current: 88, unit: "%", direction: "up" },
      { label: "Stockout incidents", target: 2, current: 3, unit: "/qtr", direction: "down" },
      { label: "Dual-source rate", target: 68, current: 63, unit: "%", direction: "up" }
    ]
  }
];
