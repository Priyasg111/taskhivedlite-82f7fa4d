
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "@/components/NavBar";
import VerificationCallback from "@/components/verification/VerificationCallback";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const VerificationComplete = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to complete verification",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }

    setIsLoading(false);
  }, [user, navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1 container py-12 px-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 container py-12 px-4 flex items-center justify-center">
        <VerificationCallback />
      </main>
    </div>
  );
};

export default VerificationComplete;
