import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LiveNotifications } from '@/components/LiveNotifications';
import NotFound from '@/pages/not-found';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import DashboardOverview from '@/pages/dashboard/index';
import Investments from '@/pages/dashboard/Investments';
import Deposits from '@/pages/dashboard/Deposits';
import Withdrawals from '@/pages/dashboard/Withdrawals';
import Transactions from '@/pages/dashboard/Transactions';
import Earnings from '@/pages/dashboard/Earnings';
import Referral from '@/pages/dashboard/Referral';
import Notifications from '@/pages/dashboard/Notifications';
import Profile from '@/pages/dashboard/Profile';

// Admin
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import { AdminLayout } from '@/components/admin/AdminLayout';
import AdminLogin from '@/pages/admin/Login';
import AdminDashboard from '@/pages/admin/index';
import AdminUsers from '@/pages/admin/Users';
import AdminWithdrawals from '@/pages/admin/Withdrawals';
import AdminPlans from '@/pages/admin/Plans';
import AdminAnalytics from '@/pages/admin/Analytics';
import AdminSettings from '@/pages/admin/Settings';
import AdminDeposits from '@/pages/admin/Deposits';
import { InvestmentPlansProvider } from '@/lib/investment-plans';
import { InvestmentsProvider } from '@/lib/investments';
import AdminInvestments from '@/pages/admin/Investments';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* User dashboard */}
      <Route path="/dashboard">
        <DashboardLayout><DashboardOverview /></DashboardLayout>
      </Route>
      <Route path="/dashboard/investments">
        <DashboardLayout><Investments /></DashboardLayout>
      </Route>
      <Route path="/dashboard/deposits">
        <DashboardLayout><Deposits /></DashboardLayout>
      </Route>
      <Route path="/dashboard/withdrawals">
        <DashboardLayout><Withdrawals /></DashboardLayout>
      </Route>
      <Route path="/dashboard/transactions">
        <DashboardLayout><Transactions /></DashboardLayout>
      </Route>
      <Route path="/dashboard/earnings">
        <DashboardLayout><Earnings /></DashboardLayout>
      </Route>
      <Route path="/dashboard/referral">
        <DashboardLayout><Referral /></DashboardLayout>
      </Route>
      <Route path="/dashboard/notifications">
        <DashboardLayout><Notifications /></DashboardLayout>
      </Route>
      <Route path="/dashboard/profile">
        <DashboardLayout><Profile /></DashboardLayout>
      </Route>

      {/* Admin panel — public login page */}
      <Route path="/admin/login" component={AdminLogin} />

      {/* Admin panel — protected routes */}
      <Route path="/admin">
        <AdminLayout><AdminDashboard /></AdminLayout>
      </Route>
      <Route path="/admin/users">
        <AdminLayout><AdminUsers /></AdminLayout>
      </Route>
      <Route path="/admin/withdrawals">
        <AdminLayout><AdminWithdrawals /></AdminLayout>
      </Route>
      <Route path="/admin/plans">
        <AdminLayout><AdminPlans /></AdminLayout>
      </Route>
      <Route path="/admin/analytics">
        <AdminLayout><AdminAnalytics /></AdminLayout>
      </Route>
      <Route path="/admin/deposits">
        <AdminLayout><AdminDeposits /></AdminLayout>
      </Route>
      <Route path="/admin/investments">
        <AdminLayout><AdminInvestments /></AdminLayout>
      </Route>
      <Route path="/admin/settings">
        <AdminLayout><AdminSettings /></AdminLayout>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminAuthProvider>
        <InvestmentPlansProvider>
          <InvestmentsProvider>
            <TooltipProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
                <Router />
              </WouterRouter>
              <Toaster />
              <LiveNotifications />
            </TooltipProvider>
          </InvestmentsProvider>
        </InvestmentPlansProvider>
      </AdminAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
