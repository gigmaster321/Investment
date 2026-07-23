import { Router, type IRouter } from "express";

export type PlanStatus = "Active" | "Disabled";

export interface InvestmentPlan {
  id: string;
  name: string;
  minInvestment: number;
  maxInvestment: number | null;
  profitPercentage: number;
  returnRange?: string;
  executionCycle: string;
  description: string;
  overview?: string;
  features: string[];
  status: PlanStatus;
  displayOrder: number;
  investors: number;
  totalDeposited: number;
}

type PlanInput = Omit<
  InvestmentPlan,
  "id" | "investors" | "totalDeposited"
>;

const plans = new Map<string, InvestmentPlan>([
  [
    "starter-ai",
    {
      id: "starter-ai",
      name: "Starter AI",
      minInvestment: 1000,
      maxInvestment: 10000,
      profitPercentage: 200,
      returnRange: "200% – 350%",
      executionCycle: "24 Hours",
      description: "Based on historical backtesting and volatility-adjusted strategy modeling.",
      overview: "Designed for new investors seeking structured exposure to innovation-focused equities with automated risk controls.",
      features: [
        "Automated trade execution",
        "Risk-adjusted capital deployment",
        "Portfolio rebalancing",
        "Monthly performance reporting",
      ],
      status: "Active",
      displayOrder: 1,
      investors: 1842,
      totalDeposited: 284100,
    },
  ],
  [
    "growth-ai",
    {
      id: "growth-ai",
      name: "Growth AI",
      minInvestment: 10000,
      maxInvestment: 100000,
      profitPercentage: 350,
      returnRange: "350% – 550%",
      executionCycle: "3 Days",
      description: "Advanced signal detection with volatility-aware execution framework.",
      overview: "Enhanced AI signal modeling focused on high-growth innovation sectors and dynamic capital rotation.",
      features: [
        "High-frequency signal detection",
        "Sector rotation strategy",
        "Volatility hedging logic",
        "Weekly analytics dashboard",
      ],
      status: "Active",
      displayOrder: 2,
      investors: 1203,
      totalDeposited: 3600000,
    },
  ],
  [
    "elite-ai",
    {
      id: "elite-ai",
      name: "Elite AI",
      minInvestment: 100000,
      maxInvestment: null,
      profitPercentage: 700,
      returnRange: "+700%",
      executionCycle: "5 Days",
      description: "Multi-layered AI execution across diversified innovation assets.",
      overview: "Designed for large capital deployment with structured downside protection and dynamic reallocation systems.",
      features: [
        "Cross-sector AI allocation engine",
        "Downside risk containment protocol",
        "Real-time capital rebalancing",
        "Dedicated strategy oversight",
      ],
      status: "Active",
      displayOrder: 3,
      investors: 614,
      totalDeposited: 18200000,
    },
  ],
]);

export function getInvestmentPlanById(id: string) {
  return plans.get(id);
}

export function recordPlanInvestment(id: string, amount: number) {
  const plan = plans.get(id);
  if (!plan) return;
  plans.set(id, {
    ...plan,
    investors: plan.investors + 1,
    totalDeposited: plan.totalDeposited + amount,
  });
}

function validatePlanInput(value: unknown): value is PlanInput {
  if (!value || typeof value !== "object") return false;
  const input = value as Partial<PlanInput>;
  return (
    typeof input.name === "string" &&
    input.name.trim().length > 0 &&
    typeof input.minInvestment === "number" &&
    input.minInvestment >= 0 &&
    (input.maxInvestment === null ||
      (typeof input.maxInvestment === "number" && input.maxInvestment >= input.minInvestment)) &&
    typeof input.profitPercentage === "number" &&
    input.profitPercentage >= 0 &&
    typeof input.executionCycle === "string" &&
    input.executionCycle.trim().length > 0 &&
    typeof input.description === "string" &&
    Array.isArray(input.features) &&
    input.features.every((feature) => typeof feature === "string" && feature.trim().length > 0) &&
    (input.status === "Active" || input.status === "Disabled") &&
    typeof input.displayOrder === "number" &&
    Number.isInteger(input.displayOrder) &&
    input.displayOrder >= 0
  );
}

function orderedPlans() {
  return [...plans.values()].sort((a, b) => a.displayOrder - b.displayOrder);
}

function badRequest(res: Parameters<IRouter["post"]>[1] extends never ? never : any, detail: string) {
  res.status(400).json({ title: "Invalid plan", detail });
}

const router: IRouter = Router();

router.get("/", (_req, res) => {
  res.json(orderedPlans());
});

router.get("/:planId", (req, res) => {
  const plan = plans.get(String(req.params.planId));
  if (!plan) {
    res.status(404).json({ title: "Plan not found", detail: "The requested investment plan does not exist." });
    return;
  }
  res.json(plan);
});

router.post("/", (req, res) => {
  if (!validatePlanInput(req.body)) {
    badRequest(res, "Provide a name, valid investment range, profit percentage, execution cycle, description, features, status, and display order.");
    return;
  }

  const baseId = req.body.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "plan";
  let id = baseId;
  let suffix = 2;
  while (plans.has(id)) id = `${baseId}-${suffix++}`;

  const plan: InvestmentPlan = {
    ...req.body,
    id,
    name: req.body.name.trim(),
    executionCycle: req.body.executionCycle.trim(),
    description: req.body.description.trim(),
    features: req.body.features.map((feature: string) => feature.trim()).filter(Boolean),
    investors: 0,
    totalDeposited: 0,
  };
  plans.set(id, plan);
  res.status(201).json(plan);
});

router.put("/:planId", (req, res) => {
  const existing = plans.get(String(req.params.planId));
  if (!existing) {
    res.status(404).json({ title: "Plan not found", detail: "The requested investment plan does not exist." });
    return;
  }
  if (!validatePlanInput(req.body)) {
    badRequest(res, "Provide all required plan fields with valid values.");
    return;
  }

  const plan: InvestmentPlan = {
    ...req.body,
    id: existing.id,
    name: req.body.name.trim(),
    executionCycle: req.body.executionCycle.trim(),
    description: req.body.description.trim(),
    features: req.body.features.map((feature: string) => feature.trim()).filter(Boolean),
    investors: existing.investors,
    totalDeposited: existing.totalDeposited,
  };
  plans.set(existing.id, plan);
  res.json(plan);
});

router.patch("/:planId/status", (req, res) => {
  const existing = plans.get(String(req.params.planId));
  if (!existing) {
    res.status(404).json({ title: "Plan not found", detail: "The requested investment plan does not exist." });
    return;
  }
  if (req.body?.status !== "Active" && req.body?.status !== "Disabled") {
    badRequest(res, 'Status must be either "Active" or "Disabled".');
    return;
  }
  const plan = { ...existing, status: req.body.status as PlanStatus };
  plans.set(existing.id, plan);
  res.json(plan);
});

router.delete("/:planId", (req, res) => {
  const id = String(req.params.planId);
  if (!plans.delete(id)) {
    res.status(404).json({ title: "Plan not found", detail: "The requested investment plan does not exist." });
    return;
  }
  res.json({ success: true, message: `Plan ${id} deleted.` });
});

export default router;