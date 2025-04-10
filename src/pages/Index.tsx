
import NavBar from "@/components/NavBar";
import Dashboard from "@/components/Dashboard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 container py-8 px-4">
        {!user && (
          <div className="mb-12 py-12 text-center">
            <h1 className="text-4xl font-bold mb-4">
              Complete Tasks, Earn Crypto - <span className="bg-gradient-to-r from-brand-blue to-brand-teal text-transparent bg-clip-text">Verified by AI</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Join TaskHived to work on microtasks from anywhere. Our AI system verifies your work, ensuring fair payment for quality results.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/signup">Sign Up Now</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/login">Log In</Link>
              </Button>
            </div>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-muted/50 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Flexible Work</h3>
                <p className="text-muted-foreground">Complete tasks anywhere, anytime. Work as much or as little as you want.</p>
              </div>
              <div className="bg-muted/50 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Instant Verification</h3>
                <p className="text-muted-foreground">Our AI system verifies your work immediately, so you get paid faster.</p>
              </div>
              <div className="bg-muted/50 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Crypto Payments</h3>
                <p className="text-muted-foreground">Receive payments in cryptocurrency directly to your wallet.</p>
              </div>
            </div>
          </div>
        )}
        <Dashboard />
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

export default Index;
