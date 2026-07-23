import { Router, type IRouter } from "express";

export type PlanStatus = "Active" | "Disabled";

export interface InvestmentPlan {
  id: string;
  name: string;
  minInvestment: number;
  maxInvestment: number | null;
  profitPercentage: number;
  executionCycle: string;
  description: string;
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
    "starter",
    {
      id: "starter",
      name: "Starter",
      minInvestment: 100,
      maxInvestment: 999,
      profitPercentage: 5,
      executionCycle: "30 days",
      description: "A practical starting point for building a diversified portfolio.",
      features: ["Daily ROI payouts", "Email support", "Basic analytics", "Referral bonus 2%"],
      status: "Active",
      displayOrder: 1,
      investors: 1842,
      totalDeposited: 284100,
    },
  ],
  [
    "silver",
    {
      id: "silver",
      name: "Silver",
      minInvestment: 1000,
      maxInvestment: 4999,
      profitPercentage: 8,
      executionCycle: "30 days",
      description: "More room to grow with enhanced support and reporting.",
      features: ["Daily ROI payouts", "Priority email support", "Advanced analytics", "Referral bonus 4%", "Faster withdrawals"],
      status: "Active",
      displayOrder: 2,
      investors: 1203,
      totalDeposited: 3600000,
    },
  ],
  [
    "gold",
    {
      id: "gold",
      name: "Gold",
      minInvestment: 5000,
      maxInvestment: 24999,
      profitPercentage: 12,
      executionCycle: "30 days",
      description: "A high-touch plan for investors seeking stronger portfolio support.",
      features: ["Daily ROI payouts", "24/7 dedicated support", "Full analytics suite", "Referral bonus 6%", "Same-day withdrawals", "Portfolio manager"],
      status: "Active",
      displayOrder: 3,
      investors: 614,
      totalDeposited: 18200000,
    },
  ],
  [
    "platinum",
    {
      id: "platinum",
      name: "Platinum",
      minInvestment: 25000,
      maxInvestment: null,
      profitPercentage: 18,
      executionCycle: "30 days",
      description: "VIP portfolio access with dedicated strategy oversight.",
      features: ["Daily ROI payouts", "Personal account manager", "Real-time analytics", "Referral bonus 10%", "Instant withdrawals", "VIP investment advisory", "Custom strategies"],
      status: "Active",
      displayOrder: 4,
      investors: 162,
      totalDeposited: 47800000,
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