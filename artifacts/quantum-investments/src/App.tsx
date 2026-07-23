import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LiveNotifications } from '@/components/LiveNotifications';
import NotFound from '@/pages/not-found';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';

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

      {/* User dashboard — all routes protected */}
      <Route path="/dashboard">
        <ProtectedRoute>
          <DashboardLayout><DashboardOverview /></DashboardLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/investments">
        <ProtectedRoute>
          <DashboardLayout><Investments /></DashboardLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/deposits">
        <ProtectedRoute>
          <DashboardLayout><Deposits /></DashboardLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/withdrawals">
        <ProtectedRoute>
          <DashboardLayout><Withdrawals /></DashboardLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/transactions">
        <ProtectedRoute>
          <DashboardLayout><Transactions /></DashboardLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/earnings">
        <ProtectedRoute>
          <DashboardLayout><Earnings /></DashboardLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/referral">
        <ProtectedRoute>
          <DashboardLayout><Referral /></DashboardLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/notifications">
        <ProtectedRoute>
          <DashboardLayout><Notifications /></DashboardLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/profile">
        <ProtectedRoute>
          <DashboardLayout><Profile /></DashboardLayout>
        </ProtectedRoute>
      </Route>

      {/* Admin panel — public login page */}
      <Route path="/admin/login" component={AdminLogin} />

      {/* Admin panel — protected routes (AdminGuard handles auth + role checks) */}
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
      <AuthProvider>
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
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
