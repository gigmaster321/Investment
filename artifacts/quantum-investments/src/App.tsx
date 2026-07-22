import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
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

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
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
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
