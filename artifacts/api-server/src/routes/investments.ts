import { Router, type IRouter, type Request } from "express";
import { getInvestmentPlanById, recordPlanInvestment } from "./plans";

export type InvestmentStatus = "Pending" | "Active" | "Completed" | "Cancelled";
export type InvestmentAction = "activate" | "pause" | "complete" | "cancel";

export interface InvestmentUser {
  id: string;
  name: string;
  email: string;
}

export interface InvestmentPlanSnapshot {
  id: string;
  name: string;
  executionCycle: string;
}

export interface Investment {
  id: string;
  user: InvestmentUser;
  plan: InvestmentPlanSnapshot;
  investmentAmount: number;
  profitPercentage: number;
  investmentDate: string;
  maturityDate: string;
  status: InvestmentStatus;
  isPaused: boolean;
  expectedReturn: number;
}

interface CreateInvestmentInput {
  planId: string;
  amount: number;
}

const DEFAULT_USER: InvestmentUser = {
  id: "user-demo-001",
  name: "John Doe",
  email: "john.doe@example.com",
};

const investments = new Map<string, Investment>();
let nextInvestmentNumber = 1;

function requestUser(req: Request): InvestmentUser {
  const userId = typeof req.header("x-user-id") === "string" && req.header("x-user-id")!.trim()
    ? req.header("x-user-id")!.trim()
    : DEFAULT_USER.id;
  const name = typeof req.header("x-user-name") === "string" && req.header("x-user-name")!.trim()
    ? req.header("x-user-name")!.trim()
    : DEFAULT_USER.name;
  const email = typeof req.header("x-user-email") === "string" && req.header("x-user-email")!.trim()
    ? req.header("x-user-email")!.trim()
    : DEFAULT_USER.email;
  return { id: userId, name, email };
}

function parseCycleDays(cycle: string) {
  const match = cycle.match(/\d+/);
  const days = match ? Number(match[0]) : 30;
  return Number.isFinite(days) && days > 0 ? days : 30;
}

function parseInvestmentId(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function orderedInvestments() {
  return [...investments.values()].sort(
    (a, b) => new Date(b.investmentDate).getTime() - new Date(a.investmentDate).getTime(),
  );
}

function validateCreateInput(value: unknown): value is CreateInvestmentInput {
  if (!value || typeof value !== "object") return false;
  const input = value as Partial<CreateInvestmentInput>;
  return (
    typeof input.planId === "string" &&
    input.planId.trim().length > 0 &&
    typeof input.amount === "number" &&
    Number.isFinite(input.amount) &&
    input.amount > 0
  );
}

function toInvestmentResponse(investment: Investment) {
  return {
    ...investment,
    remainingSeconds: Math.max(
      0,
      Math.ceil((new Date(investment.maturityDate).getTime() - Date.now()) / 1000),
    ),
    displayStatus: investment.isPaused ? "Paused" : investment.status,
  };
}

function createInvestment(input: CreateInvestmentInput, user: InvestmentUser) {
  const plan = getInvestmentPlanById(input.planId);
  if (!plan) {
    return { error: "The selected investment plan does not exist.", status: 404 as const };
  }
  if (plan.status !== "Active") {
    return { error: "The selected investment plan is not currently active.", status: 409 as const };
  }
  if (input.amount < plan.minInvestment || (plan.maxInvestment !== null && input.amount > plan.maxInvestment)) {
    return { error: "The investment amount is outside this plan's allowed range.", status: 400 as const };
  }

  const investmentDate = new Date();
  const maturityDate = new Date(investmentDate);
  maturityDate.setDate(maturityDate.getDate() + parseCycleDays(plan.executionCycle));
  const id = `INV-${String(nextInvestmentNumber++).padStart(5, "0")}`;
  const investment: Investment = {
    id,
    user,
    plan: {
      id: plan.id,
      name: plan.name,
      executionCycle: plan.executionCycle,
    },
    investmentAmount: input.amount,
    // Snapshot the plan rate at creation time. Future plan edits cannot alter this record.
    profitPercentage: plan.profitPercentage,
    investmentDate: investmentDate.toISOString(),
    maturityDate: maturityDate.toISOString(),
    status: "Pending",
    isPaused: false,
    expectedReturn: Number((input.amount * (1 + plan.profitPercentage / 100)).toFixed(2)),
  };
  investments.set(id, investment);
  recordPlanInvestment(plan.id, input.amount);
  return { investment };
}

const router: IRouter = Router();

router.get("/", (req, res) => {
  const scope = req.query.scope;
  const userId = typeof req.query.userId === "string" ? req.query.userId : requestUser(req).id;
  const rows = scope === "all"
    ? orderedInvestments()
    : orderedInvestments().filter((investment) => investment.user.id === userId);
  res.json(rows.map(toInvestmentResponse));
});

router.get("/:investmentId", (req, res) => {
  const id = parseInvestmentId(req.params.investmentId);
  const investment = id ? investments.get(id) : undefined;
  if (!investment) {
    res.status(404).json({ title: "Investment not found", detail: "The requested investment does not exist." });
    return;
  }
  res.json(toInvestmentResponse(investment));
});

router.post("/", (req, res) => {
  if (!validateCreateInput(req.body)) {
    res.status(400).json({ title: "Invalid investment", detail: "Provide a valid planId and investment amount." });
    return;
  }
  const result = createInvestment(req.body, requestUser(req));
  if ("error" in result) {
    res.status(result.status ?? 400).json({ title: "Investment could not be created", detail: result.error });
    return;
  }
  res.status(201).json(toInvestmentResponse(result.investment));
});

router.patch("/:investmentId/status", (req, res) => {
  const id = parseInvestmentId(req.params.investmentId);
  const existing = id ? investments.get(id) : undefined;
  if (!existing) {
    res.status(404).json({ title: "Investment not found", detail: "The requested investment does not exist." });
    return;
  }
  const action = req.body?.action as InvestmentAction;
  if (!["activate", "pause", "complete", "cancel"].includes(action)) {
    res.status(400).json({ title: "Invalid investment action", detail: "Action must be activate, pause, complete, or cancel." });
    return;
  }

  const next: Investment = { ...existing };
  if (action === "activate") {
    next.status = "Active";
    next.isPaused = false;
  } else if (action === "pause") {
    if (next.status === "Completed" || next.status === "Cancelled") {
      res.status(409).json({ title: "Invalid investment transition", detail: "Completed or cancelled investments cannot be paused." });
      return;
    }
    next.status = "Active";
    next.isPaused = true;
  } else if (action === "complete") {
    next.status = "Completed";
    next.isPaused = false;
  } else {
    next.status = "Cancelled";
    next.isPaused = false;
  }
  investments.set(existing.id, next);
  res.json(toInvestmentResponse(next));
});

export default router;