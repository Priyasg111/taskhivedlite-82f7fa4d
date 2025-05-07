
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/auth";
import { useKeepAlive } from "./hooks/useKeepAlive";
import { useAuth } from "./context/auth";
import Index from "./pages/Index";
import PostTask from "./pages/PostTask";
import CompleteTasks from "./pages/CompleteTasks";
import Payments from "./pages/Payments";
import PaymentsDashboard from "./pages/PaymentsDashboard";
import PaymentSetupPage from "./pages/PaymentSetupPage";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerificationComplete from "./pages/VerificationComplete";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import WorkerDashboard from "./pages/WorkerDashboard";
import EmployerDashboard from "./pages/EmployerDashboard";
import EmployerConsole from "./pages/EmployerConsole";
import TaskRoom from "./pages/TaskRoom";
import Unauthorized from "./pages/Unauthorized";
import Dashboard from "./pages/Dashboard";

const queryClient = new QueryClient();

// ProtectedRoute component to handle authentication and redirection
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>;
  }
  
  if (!user) {
    // Redirect to login with returnTo parameter
    const currentPath = window.location.pathname;
    return <Navigate to={`/login?returnTo=${currentPath}`} replace />;
  }
  
  return <>{children}</>;
};

// ClientOnlyRoute component to handle client-specific routes
const ClientOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>;
  }
  
  // Check if user is logged in and has client role
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.user_metadata?.role !== 'client') {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};

// WorkerOnlyRoute component to handle worker-specific routes
const WorkerOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>;
  }
  
  // Allow unauthenticated users but redirect to login
  if (!user) {
    const currentPath = window.location.pathname;
    return <Navigate to={`/login?returnTo=${currentPath}`} replace />;
  }
  
  // Check if user has worker role
  if (user.user_metadata?.role !== 'worker') {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};

const AppContent = () => {
  // Initialize the keep-alive ping with online detection
  const { isOnline } = useKeepAlive();
  
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white py-1 px-4 text-center z-50">
          Connection lost. Attempting to reconnect...
        </div>
      )}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/post-task" element={<ClientOnlyRoute><PostTask /></ClientOnlyRoute>} />
        <Route path="/complete-tasks" element={<WorkerOnlyRoute><CompleteTasks /></WorkerOnlyRoute>} />
        <Route path="/complete-tasks/:taskId" element={<WorkerOnlyRoute><CompleteTasks /></WorkerOnlyRoute>} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/payments-dashboard" element={<PaymentsDashboard />} />
        <Route path="/payment-setup" element={<PaymentSetupPage />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verification-complete" element={<VerificationComplete />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/worker-dashboard" element={<WorkerDashboard />} />
        <Route path="/employer-dashboard" element={<EmployerDashboard />} />
        <Route path="/employer-console" element={<EmployerConsole />} />
        <Route path="/task-room" element={<TaskRoom />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
