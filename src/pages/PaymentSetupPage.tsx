
import NavBar from "@/components/NavBar";
import PaymentSetup from "@/components/payment/PaymentSetup";
import { useAuth } from "@/context/auth";
import { Navigate } from "react-router-dom";
import Footer from "@/components/Footer";

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
      <Footer />
    </div>
  );
};

export default PaymentSetupPage;
