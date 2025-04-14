
import NavBar from "@/components/NavBar";
import PaymentSetup from "@/components/payment/PaymentSetup";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";

const PaymentSetupPage = () => {
  const { user } = useAuth();

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 container py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Payment Setup</h1>
          <p className="text-muted-foreground mt-2">
            Configure how you want to receive payments for completed tasks.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <PaymentSetup />
        </div>
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © 2025 TaskHived - AI-Verified Microtask Marketplace
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PaymentSetupPage;
