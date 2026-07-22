import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { ShieldCheck, Lock, ArrowRight, TrendingUp, Activity, PieChart } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

const chartData = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 4500 },
  { name: 'Mar', value: 4200 },
  { name: 'Apr', value: 5800 },
  { name: 'May', value: 5100 },
  { name: 'Jun', value: 6800 },
  { name: 'Jul', value: 7400 },
  { name: 'Aug', value: 8100 },
  { name: 'Sep', value: 8900 },
];

const pieData = [
  { name: 'S&P 500', value: 45 },
  { name: 'Tech Growth', value: 30 },
  { name: 'Bonds', value: 25 },
];

const COLORS = ['#1565D8', '#1EA7FF', '#0B2A6F'];

export function HeroSection() {
  const [, setLocation] = useLocation();

  const scrollToPlans = () => {
    document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[100dvh] flex items-center pt-24 pb-12 overflow-hidden">
      {/* Background Gradient & Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-secondary/40 via-background to-background z-0" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSIjM0YzRjRGIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuMDUiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+PHBhdGggZD0iTTAgNjBoNjBNNjAgMEwwIDYwIi8+PC9nPjwvc3ZnPg==')] z-0 opacity-20" />

      <div className="container relative z-10 mx-auto px-6 h-full flex flex-col lg:flex-row items-center gap-16">
        
        {/* Left Content */}
        <motion.div 
          className="flex-1 max-w-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-white/10 mb-8 backdrop-blur-sm">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <span className="text-xs font-semibold text-white tracking-wide uppercase">Trusted Investment Platform</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
            Build Wealth <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-white">With Confidence</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-xl">
            Quantum Investments delivers intelligent portfolio management, diversified strategies, and proven results — helping thousands of investors achieve financial independence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button onClick={() => setLocation('/register')} className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-full text-base font-semibold transition-all hover:shadow-[0_0_30px_rgba(21,101,232,0.4)] flex items-center justify-center gap-2 group">
              Start Investing Today
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={scrollToPlans} className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-4 rounded-full text-base font-semibold transition-all flex items-center justify-center gap-2">
              View Our Plans
            </button>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground/80">
            <Lock className="w-4 h-4" />
            <span>Secure & Regulated &middot; SEC Registered &middot; 256-bit Encryption</span>
          </div>
        </motion.div>

        {/* Right Dashboard Visualization */}
        <motion.div 
          className="flex-1 w-full lg:w-auto relative"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          <div className="relative z-10 bg-card/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-primary/10 w-full max-w-lg mx-auto transform lg:translate-x-12 hover:-translate-y-2 transition-transform duration-500">
            {/* Window Controls */}
            <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
              <div className="w-3 h-3 rounded-full bg-white/20" />
              <div className="w-3 h-3 rounded-full bg-white/20" />
              <div className="w-3 h-3 rounded-full bg-white/20" />
              <div className="ml-auto flex items-center gap-2 text-xs font-medium text-white/50">
                <Activity className="w-3 h-3" />
                Live Portfolio
              </div>
            </div>

            {/* Main Value */}
            <div className="mb-6">
              <div className="text-sm font-medium text-muted-foreground mb-1">Total Balance</div>
              <div className="flex items-end gap-4">
                <div className="text-4xl font-bold text-white">$142,854.20</div>
                <div className="flex items-center text-accent text-sm font-medium mb-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +12.4% All time
                </div>
              </div>
            </div>

            {/* Line Chart */}
            <div className="h-40 w-full mb-8 relative">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'rgba(255,255,255,0.1)' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, fill: "hsl(var(--accent))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            {/* Bottom Widgets */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background/50 rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-3">
                  <PieChart className="w-4 h-4" />
                  Allocation
                </div>
                <div className="h-24 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={25}
                        outerRadius={40}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-background/50 rounded-xl p-4 border border-white/5 flex flex-col justify-center">
                <div className="text-xs font-medium text-muted-foreground mb-3">Top Holdings</div>
                <div className="space-y-3">
                  {pieData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                        <span className="text-xs font-medium text-white">{item.name}</span>
                      </div>
                      <span className="text-xs text-white/60">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
          </div>
          
          {/* Decorative elements behind dashboard */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/20 blur-[120px] rounded-full pointer-events-none z-0" />
        </motion.div>
      </div>
    </section>
  );
}
