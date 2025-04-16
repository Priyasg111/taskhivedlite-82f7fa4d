
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/post-task" element={<PostTask />} />
            <Route path="/complete-tasks" element={<CompleteTasks />} />
            <Route path="/complete-tasks/:taskId" element={<CompleteTasks />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/payments-dashboard" element={<PaymentsDashboard />} />
            <Route path="/payment-setup" element={<PaymentSetupPage />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verification-complete" element={<VerificationComplete />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
