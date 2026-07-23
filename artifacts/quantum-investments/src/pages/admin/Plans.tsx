import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award, Check, ChevronDown, CreditCard, Edit3, Eye, Gem,
  Plus, Save, ShieldCheck, Star, Trash2, X, Zap,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  formatInvestmentAmount,
  type InvestmentPlan,
  type PlanInput,
  type PlanStatus,
  useInvestmentPlans,
} from '@/lib/investment-plans';

const PLAN_ACCENTS = {
  starter: { icon: Zap, accent: 'text-slate-300', border: 'border-slate-500/25', badge: 'bg-slate-500/15 border-slate-400/20 text-slate-300' },
  silver: { icon: Star, accent: 'text-slate-200', border: 'border-slate-400/30', badge: 'bg-slate-400/15 border-slate-300/20 text-slate-200' },
  gold: { icon: Award, accent: 'text-amber-300', border: 'border-amber-500/30', badge: 'bg-amber-500/15 border-amber-400/20 text-amber-300' },
  platinum: { icon: Gem, accent: 'text-cyan-300', border: 'border-cyan-500/30', badge: 'bg-cyan-500/15 border-cyan-400/20 text-cyan-300' },
} as const;

function planAccent(plan: InvestmentPlan) {
  return PLAN_ACCENTS[plan.id as keyof typeof PLAN_ACCENTS] ?? PLAN_ACCENTS.starter;
}

function money(value: number) {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function ModalShell({ children, onClose, wide = false }: {
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
        style={{ background: 'rgba(5,12,28,0.88)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 8 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0 }}
          className={`relative bg-[hsl(221,70%,10%)] border border-white/10 rounded-2xl w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} shadow-2xl my-auto`}
          onClick={(event) => event.stopPropagation()}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ModalHeader({ title, subtitle, onClose }: {
  title: string;
  subtitle?: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
      <div>
        <p className="text-sm font-bold text-white">{title}</p>
        {subtitle && <p className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10 transition-colors">
        <X size={16} />
      </button>
    </div>
  );
}

function StatusBadge({ status }: { status: PlanStatus }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
      status === 'Active'
        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
        : 'text-muted-foreground bg-white/5 border-white/10'
    }`}>
      {status === 'Active' && <ShieldCheck size={9} />}
      {status}
    </span>
  );
}

interface PlanFormValues {
  name: string;
  minInvestment: string;
  maxInvestment: string;
  profitPercentage: string;
  executionCycle: string;
  description: string;
  features: string[];
  status: PlanStatus;
  displayOrder: string;
}

function formValues(plan?: InvestmentPlan): PlanFormValues {
  return {
    name: plan?.name ?? '',
    minInvestment: plan ? String(plan.minInvestment) : '',
    maxInvestment: plan?.maxInvestment === null ? '' : plan ? String(plan.maxInvestment) : '',
    profitPercentage: plan ? String(plan.profitPercentage) : '',
    executionCycle: plan?.executionCycle ?? '30 days',
    description: plan?.description ?? '',
    features: plan?.features.length ? [...plan.features] : [''],
    status: plan?.status ?? 'Active',
    displayOrder: plan ? String(plan.displayOrder) : '1',
  };
}

function PlanFormModal({
  plan,
  onClose,
  onSave,
}: {
  plan?: InvestmentPlan;
  onClose: () => void;
  onSave: (input: PlanInput) => Promise<void>;
}) {
  const [form, setForm] = useState(() => formValues(plan));
  const [saving, setSaving] = useState(false);
  const fieldCls = 'w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3.5 text-white text-xs placeholder:text-white/20 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all';
  const labelCls = 'block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1.5';
  const selectCls = 'w-full bg-[hsl(221,70%,8%)] border border-white/10 rounded-xl py-2.5 px-3.5 text-white text-xs focus:outline-none focus:border-accent/50 transition-all appearance-none';

  function update<K extends keyof PlanFormValues>(key: K, value: PlanFormValues[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const min = Number(form.minInvestment);
    const max = form.maxInvestment.trim() === '' ? null : Number(form.maxInvestment);
    const profit = Number(form.profitPercentage);
    const order = Number(form.displayOrder);
    const features = form.features.map((feature) => feature.trim()).filter(Boolean);

    if (!form.name.trim() || !Number.isFinite(min) || min < 0 || (max !== null && (!Number.isFinite(max) || max < min)) ||
      !Number.isFinite(profit) || profit < 0 || !form.executionCycle.trim() || !form.description.trim() ||
      features.length === 0 || !Number.isInteger(order) || order < 0) {
      toast({ title: 'Check plan details', description: 'Complete all required fields with valid values.' });
      return;
    }

    setSaving(true);
    try {
      await onSave({
        name: form.name.trim(),
        minInvestment: min,
        maxInvestment: max,
        profitPercentage: profit,
        executionCycle: form.executionCycle.trim(),
        description: form.description.trim(),
        features,
        status: form.status,
        displayOrder: order,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell onClose={onClose} wide>
      <ModalHeader
        title={plan ? 'Edit Investment Plan' : 'Create New Plan'}
        subtitle={plan ? `Update ${plan.name} plan details` : 'Add a plan to the investment catalog'}
        onClose={onClose}
      />
      <form onSubmit={submit}>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className={labelCls}>Plan Name</label>
            <input required value={form.name} onChange={(e) => update('name', e.target.value)} className={fieldCls} placeholder="e.g. Gold" />
          </div>
          <div>
            <label className={labelCls}>Execution Cycle</label>
            <input required value={form.executionCycle} onChange={(e) => update('executionCycle', e.target.value)} className={fieldCls} placeholder="e.g. 30 days" />
          </div>
          <div>
            <label className={labelCls}>Minimum Investment</label>
            <input required type="number" min="0" value={form.minInvestment} onChange={(e) => update('minInvestment', e.target.value)} className={fieldCls} placeholder="100" />
          </div>
          <div>
            <label className={labelCls}>Maximum Investment</label>
            <input type="number" min="0" value={form.maxInvestment} onChange={(e) => update('maxInvestment', e.target.value)} className={fieldCls} placeholder="Leave blank for unlimited" />
          </div>
          <div>
            <label className={labelCls}>Target Profit Percentage</label>
            <div className="relative">
              <input required type="number" min="0" step="0.01" value={form.profitPercentage} onChange={(e) => update('profitPercentage', e.target.value)} className={`${fieldCls} pr-8`} placeholder="12" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
            </div>
          </div>
          <div>
            <label className={labelCls}>Plan Status</label>
            <div className="relative">
              <select value={form.status} onChange={(e) => update('status', e.target.value as PlanStatus)} className={selectCls}>
                <option value="Active">Active</option>
                <option value="Disabled">Disabled</option>
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Short Description</label>
            <textarea required rows={3} value={form.description} onChange={(e) => update('description', e.target.value)} className={`${fieldCls} resize-y`} placeholder="Describe who this plan is for." />
          </div>
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className={`${labelCls} mb-0`}>Features</label>
              <button type="button" onClick={() => update('features', [...form.features, ''])} className="text-[10px] text-accent hover:text-accent/70 transition-colors">
                + Add feature
              </button>
            </div>
            <div className="space-y-2">
              {form.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <input value={feature} onChange={(e) => update('features', form.features.map((item, i) => i === index ? e.target.value : item))} className={fieldCls} placeholder={`Feature ${index + 1}`} />
                  {form.features.length > 1 && (
                    <button type="button" onClick={() => update('features', form.features.filter((_, i) => i !== index))} className="px-2 text-muted-foreground hover:text-red-400 transition-colors">
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>Display Order</label>
            <input required type="number" min="0" step="1" value={form.displayOrder} onChange={(e) => update('displayOrder', e.target.value)} className={fieldCls} placeholder="1" />
          </div>
        </div>
        <div className="px-5 py-4 border-t border-white/5 flex gap-3">
          <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white text-xs font-semibold py-2.5 rounded-xl transition-all">
            <Save size={13} />
            {saving ? 'Saving…' : 'Save Plan'}
          </button>
          <button type="button" onClick={onClose} className="flex-1 text-xs font-semibold text-muted-foreground hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 py-2.5 rounded-xl transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function ViewPlanModal({ plan, onClose }: { plan: InvestmentPlan; onClose: () => void }) {
  const accent = planAccent(plan);
  return (
    <ModalShell onClose={onClose}>
      <ModalHeader title={plan.name} subtitle="Investment plan details" onClose={onClose} />
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg bg-white/5 border ${accent.border}`}>
              <accent.icon size={16} className={accent.accent} />
            </div>
            <span className={`text-sm font-bold ${accent.accent}`}>{plan.profitPercentage}%</span>
          </div>
          <StatusBadge status={plan.status} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            ['Minimum Investment', formatInvestmentAmount(plan.minInvestment)],
            ['Maximum Investment', formatInvestmentAmount(plan.maxInvestment)],
            ['Execution Cycle', plan.executionCycle],
            ['Display Order', String(plan.displayOrder)],
          ].map(([label, value]) => (
            <div key={label} className="bg-white/[0.03] border border-white/5 rounded-lg p-3">
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground/60">{label}</p>
              <p className="text-sm text-white font-semibold mt-1">{value}</p>
            </div>
          ))}
        </div>
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 mb-2">Short Description</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{plan.description}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 mb-2">Features</p>
          <ul className="space-y-2">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-xs text-muted-foreground">
                <Check size={13} className={accent.accent} />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </ModalShell>
  );
}

function DeletePlanModal({ plan, onClose, onConfirm }: { plan: InvestmentPlan; onClose: () => void; onConfirm: () => Promise<void> }) {
  const [deleting, setDeleting] = useState(false);
  async function confirm() {
    setDeleting(true);
    try {
      await onConfirm();
    } finally {
      setDeleting(false);
    }
  }
  return (
    <ModalShell onClose={onClose}>
      <div className="p-6 flex flex-col items-center text-center gap-4">
        <div className="w-12 h-12 rounded-full bg-red-500/15 border border-red-500/20 flex items-center justify-center">
          <Trash2 size={20} className="text-red-400" />
        </div>
        <div>
          <p className="text-white font-bold text-base">Delete Plan?</p>
          <p className="text-muted-foreground text-xs mt-1.5 leading-relaxed max-w-xs">
            You are about to permanently delete <span className="text-white font-semibold">{plan.name}</span>.
          </p>
        </div>
        <div className="flex gap-3 w-full mt-1">
          <button onClick={() => void confirm()} disabled={deleting} className="flex-1 bg-red-500/20 hover:bg-red-500/30 disabled:opacity-50 border border-red-500/30 text-red-400 text-xs font-semibold py-2.5 rounded-xl transition-colors">
            {deleting ? 'Deleting…' : 'Yes, Delete'}
          </button>
          <button onClick={onClose} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

type ModalMode =
  | { kind: 'view'; plan: InvestmentPlan }
  | { kind: 'edit'; plan: InvestmentPlan }
  | { kind: 'delete'; plan: InvestmentPlan }
  | { kind: 'create' }
  | null;

export default function AdminPlans() {
  const { plans, loading, error, createPlan, updatePlan, setPlanStatus, deletePlan } = useInvestmentPlans();
  const [modal, setModal] = useState<ModalMode>(null);
  const activePlans = plans.filter((plan) => plan.status === 'Active');
  const summary = useMemo(() => ({
    investors: plans.reduce((total, plan) => total + plan.investors, 0),
    averageRoi: plans.length ? plans.reduce((total, plan) => total + plan.profitPercentage, 0) / plans.length : 0,
    aum: plans.reduce((total, plan) => total + plan.totalDeposited, 0),
  }), [plans]);

  async function handleCreate(input: PlanInput) {
    try {
      await createPlan(input);
      setModal(null);
      toast({ title: '✅ Plan Created', description: 'The new investment plan is now available.' });
    } catch (cause) {
      toast({ title: 'Unable to create plan', description: cause instanceof Error ? cause.message : 'Please try again.' });
      throw cause;
    }
  }

  async function handleUpdate(plan: InvestmentPlan, input: PlanInput) {
    try {
      await updatePlan(plan.id, input);
      setModal(null);
      toast({ title: '✅ Plan Updated', description: `${input.name} was updated across the application.` });
    } catch (cause) {
      toast({ title: 'Unable to update plan', description: cause instanceof Error ? cause.message : 'Please try again.' });
      throw cause;
    }
  }

  async function handleStatus(plan: InvestmentPlan, status: PlanStatus) {
    try {
      await setPlanStatus(plan.id, status);
      toast({ title: status === 'Active' ? '✅ Plan Enabled' : 'Plan Disabled', description: `${plan.name} is now ${status.toLowerCase()}.` });
    } catch (cause) {
      toast({ title: 'Unable to update plan status', description: cause instanceof Error ? cause.message : 'Please try again.' });
    }
  }

  async function handleDelete(plan: InvestmentPlan) {
    try {
      await deletePlan(plan.id);
      setModal(null);
      toast({ title: '🗑️ Plan Deleted', description: `${plan.name} has been removed.` });
    } catch (cause) {
      toast({ title: 'Unable to delete plan', description: cause instanceof Error ? cause.message : 'Please try again.' });
      throw cause;
    }
  }

  return (
    <>
      {modal?.kind === 'create' && <PlanFormModal onClose={() => setModal(null)} onSave={handleCreate} />}
      {modal?.kind === 'edit' && <PlanFormModal plan={modal.plan} onClose={() => setModal(null)} onSave={(input) => handleUpdate(modal.plan, input)} />}
      {modal?.kind === 'view' && <ViewPlanModal plan={modal.plan} onClose={() => setModal(null)} />}
      {modal?.kind === 'delete' && <DeletePlanModal plan={modal.plan} onClose={() => setModal(null)} onConfirm={() => handleDelete(modal.plan)} />}

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Investment Plans</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Manage and monitor all active investment plans.</p>
          </div>
          <button onClick={() => setModal({ kind: 'create' })} className="self-start sm:self-auto flex items-center gap-2 text-xs font-semibold text-white bg-gradient-to-r from-primary to-accent rounded-lg px-4 py-2.5 hover:shadow-[0_0_20px_rgba(30,167,255,0.3)] hover:scale-[1.02] transition-all duration-200">
            <Plus size={14} />
            Create New Plan
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Plans', value: String(plans.length), icon: CreditCard },
            { label: 'Total Investors', value: summary.investors.toLocaleString(), icon: ShieldCheck },
            { label: 'Avg ROI', value: `${summary.averageRoi.toFixed(2)}%`, icon: Gem },
            { label: 'Total AUM', value: money(summary.aum), icon: TrendingUpIcon },
          ].map((stat) => (
            <div key={stat.label} className="bg-card/40 border border-white/5 rounded-xl p-4 flex items-center gap-3">
              <div className="bg-primary/15 p-2 rounded-lg shrink-0"><stat.icon size={16} className="text-accent" /></div>
              <div><p className="text-white font-bold text-lg leading-tight">{stat.value}</p><p className="text-muted-foreground text-[11px]">{stat.label}</p></div>
            </div>
          ))}
        </div>

        {error && <div className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">Using the last available plan data. {error}</div>}

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card/40 border border-white/5 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <div><h2 className="text-sm font-semibold text-white">All Investment Plans</h2><p className="text-[10px] text-muted-foreground mt-0.5">{activePlans.length} active · {plans.length - activePlans.length} disabled</p></div>
            {loading && <span className="text-[10px] text-muted-foreground">Refreshing…</span>}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead><tr className="border-b border-white/5">
                {['Plan Name', 'Minimum Investment', 'Maximum Investment', 'Profit Percentage', 'Execution Cycle', 'Status', 'Actions'].map((heading) => (
                  <th key={heading} className="text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 px-4 py-3 whitespace-nowrap">{heading}</th>
                ))}
              </tr></thead>
              <tbody>
                {plans.map((plan) => {
                  const accent = planAccent(plan);
                  return (
                    <tr key={plan.id} className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors">
                      <td className="px-4 py-3.5"><div className="flex items-center gap-2.5"><div className={`p-1.5 rounded-lg bg-white/5 border ${accent.border}`}><accent.icon size={13} className={accent.accent} /></div><span className="text-white text-xs font-semibold">{plan.name}</span></div></td>
                      <td className="px-4 py-3.5 text-muted-foreground text-xs whitespace-nowrap">{formatInvestmentAmount(plan.minInvestment)}</td>
                      <td className="px-4 py-3.5 text-muted-foreground text-xs whitespace-nowrap">{formatInvestmentAmount(plan.maxInvestment)}</td>
                      <td className={`px-4 py-3.5 text-xs font-bold ${accent.accent}`}>{plan.profitPercentage}%</td>
                      <td className="px-4 py-3.5 text-muted-foreground text-xs whitespace-nowrap">{plan.executionCycle}</td>
                      <td className="px-4 py-3.5"><StatusBadge status={plan.status} /></td>
                      <td className="px-4 py-3.5"><div className="flex items-center gap-1.5">
                        <button onClick={() => setModal({ kind: 'view', plan })} title="View" className="p-1.5 rounded-md text-accent hover:bg-accent/10 border border-accent/20 transition-colors"><Eye size={12} /></button>
                        <button onClick={() => setModal({ kind: 'edit', plan })} title="Edit" className="p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/10 border border-white/10 transition-colors"><Edit3 size={12} /></button>
                        <button onClick={() => void handleStatus(plan, plan.status === 'Active' ? 'Disabled' : 'Active')} title={plan.status === 'Active' ? 'Disable' : 'Enable'} className={`p-1.5 rounded-md border transition-colors ${plan.status === 'Active' ? 'text-amber-400 border-amber-500/20 hover:bg-amber-500/10' : 'text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10'}`}><ShieldCheck size={12} /></button>
                        <button onClick={() => setModal({ kind: 'delete', plan })} title="Delete" className="p-1.5 rounded-md text-red-400/70 hover:text-red-400 hover:bg-red-500/10 border border-red-500/15 transition-colors"><Trash2 size={12} /></button>
                      </div></td>
                    </tr>
                  );
                })}
                {plans.length === 0 && <tr><td colSpan={7} className="px-5 py-14 text-center text-sm text-muted-foreground">No investment plans yet. Create your first plan to get started.</td></tr>}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </>
  );
}

function TrendingUpIcon(props: React.ComponentProps<typeof Gem>) {
  return <Gem {...props} />;
}