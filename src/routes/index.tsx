
import { Navigate, RouteObject } from "react-router-dom";
import Index from "@/pages/Index";
import PostTask from "@/pages/PostTask";
import CompleteTasks from "@/pages/CompleteTasks";
import Payments from "@/pages/Payments";
import PaymentsDashboard from "@/pages/PaymentsDashboard";
import PaymentSetupPage from "@/pages/PaymentSetupPage";
import Leaderboard from "@/pages/Leaderboard";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import VerificationComplete from "@/pages/VerificationComplete";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import WorkerDashboard from "@/pages/WorkerDashboard";
import EmployerDashboard from "@/pages/EmployerDashboard";
import EmployerConsole from "@/pages/EmployerConsole";
import TaskRoom from "@/pages/TaskRoom";
import Unauthorized from "@/pages/Unauthorized";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";
import { ProtectedRoute } from "./ProtectedRoute";
import { ClientOnlyRoute } from "./ClientOnlyRoute";
import { WorkerOnlyRoute } from "./WorkerOnlyRoute";
import { EmployerOnlyRoute } from "./EmployerOnlyRoute";

// Define the routes configuration
export const routes: RouteObject[] = [
  {
    path: "/",
    element: <Index />
  },
  {
    path: "/post-task",
    element: <ClientOnlyRoute><PostTask /></ClientOnlyRoute>
  },
  {
    path: "/complete-tasks",
    element: <WorkerOnlyRoute><CompleteTasks /></WorkerOnlyRoute>
  },
  {
    path: "/complete-tasks/:taskId",
    element: <WorkerOnlyRoute><CompleteTasks /></WorkerOnlyRoute>
  },
  {
    path: "/payments",
    element: <ProtectedRoute><Payments /></ProtectedRoute>
  },
  {
    path: "/payments-dashboard",
    element: <ProtectedRoute><PaymentsDashboard /></ProtectedRoute>
  },
  {
    path: "/payment-setup",
    element: <ProtectedRoute><PaymentSetupPage /></ProtectedRoute>
  },
  {
    path: "/leaderboard",
    element: <Leaderboard />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/signup",
    element: <Signup />
  },
  {
    path: "/verification-complete",
    element: <VerificationComplete />
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />
  },
  {
    path: "/reset-password",
    element: <ResetPassword />
  },
  {
    path: "/worker-dashboard",
    element: <WorkerOnlyRoute><WorkerDashboard /></WorkerOnlyRoute>
  },
  {
    path: "/employer-dashboard",
    element: <EmployerOnlyRoute><EmployerDashboard /></EmployerOnlyRoute>
  },
  {
    path: "/employer-console",
    element: <EmployerOnlyRoute><EmployerConsole /></EmployerOnlyRoute>
  },
  {
    path: "/task-room",
    element: <WorkerOnlyRoute><TaskRoom /></WorkerOnlyRoute>
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />
  },
  {
    path: "/dashboard",
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>
  },
  {
    path: "*",
    element: <NotFound />
  }
];
