import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LiveNotifications } from '@/components/LiveNotifications';
import NotFound from '@/pages/not-found';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import { Route, Switch, Router as WouterRouter, useLocation, Redirect } from 'wouter';

import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { NotificationProvider } from '@/contexts/NotificationContext';

import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import DashboardOverview from '@/pages/dashboard/index';
import Investments from '@/pages/dashboard/Investments';
import Deposits from '@/pages/dashboard/Deposits';
import Withdrawals from '@/pages/dashboard/Withdrawals';
import Transactions from '@/pages/dashboard/Transactions';
import Earnings from '@/pages/dashboard/Earnings';
import Notifications from '@/pages/dashboard/Notifications';
import Profile from '@/pages/dashboard/Profile';
import UserChatPage from '@/features/chat/pages/UserChatPage';

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
import AdminWallets from '@/pages/admin/Wallets';
import AdminChatPage from '@/features/chat/pages/AdminChatPage';
import AdminNotifications from '@/pages/admin/Notifications';

const queryClient = new QueryClient();

/**
 * Route-aware controller — renders LiveNotifications with the correct mode:
 *   /wp-admin/*  → nothing (admin never sees popups)
 *   /dashboard/* → 'dashboard' mode (one popup every 5 minutes)
 *   everything else → 'landing' mode (rotating public activity feed)
 *
 * Must live inside <WouterRouter> so useLocation works.
 */
function LiveNotificationsController() {
  const [location] = useLocation();
  if (location.startsWith('/wp-admin')) return null;
  if (location.startsWith('/dashboard')) return <LiveNotifications mode="dashboard" />;
  return <LiveNotifications mode="landing" />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* User dashboard — requires authentication */}
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
      <Route path="/dashboard/chat">
        <ProtectedRoute>
          <DashboardLayout><UserChatPage /></DashboardLayout>
        </ProtectedRoute>
      </Route>

      {/* /admin and /admin/* redirect to homepage — no longer exposes admin */}
      <Route path="/admin/login">
        <Redirect to="/" />
      </Route>
      <Route path="/admin/:rest*">
        <Redirect to="/" />
      </Route>
      <Route path="/admin">
        <Redirect to="/" />
      </Route>

      {/* Admin panel — public login page */}
      <Route path="/wp-admin/login" component={AdminLogin} />

      {/* Admin panel — protected routes (AdminGuard handles auth + role checks) */}
      <Route path="/wp-admin">
        <AdminLayout><AdminDashboard /></AdminLayout>
      </Route>
      <Route path="/wp-admin/users">
        <AdminLayout><AdminUsers /></AdminLayout>
      </Route>
      <Route path="/wp-admin/withdrawals">
        <AdminLayout><AdminWithdrawals /></AdminLayout>
      </Route>
      <Route path="/wp-admin/plans">
        <AdminLayout><AdminPlans /></AdminLayout>
      </Route>
      <Route path="/wp-admin/analytics">
        <AdminLayout><AdminAnalytics /></AdminLayout>
      </Route>
      <Route path="/wp-admin/deposits">
        <AdminLayout><AdminDeposits /></AdminLayout>
      </Route>
      <Route path="/wp-admin/investments">
        <AdminLayout><AdminInvestments /></AdminLayout>
      </Route>
      <Route path="/wp-admin/settings">
        <AdminLayout><AdminSettings /></AdminLayout>
      </Route>
      <Route path="/wp-admin/wallets">
        <AdminLayout><AdminWallets /></AdminLayout>
      </Route>
      <Route path="/wp-admin/chat">
        <AdminLayout><AdminChatPage /></AdminLayout>
      </Route>
      <Route path="/wp-admin/notifications">
        <AdminLayout><AdminNotifications /></AdminLayout>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
        <AdminAuthProvider>
          <InvestmentPlansProvider>
            <InvestmentsProvider>
              <TooltipProvider>
                <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
                  <Router />
                  <LiveNotificationsController />
                </WouterRouter>
                <Toaster />
              </TooltipProvider>
            </InvestmentsProvider>
          </InvestmentPlansProvider>
        </AdminAuthProvider>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
