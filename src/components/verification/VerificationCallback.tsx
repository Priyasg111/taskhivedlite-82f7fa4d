
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const VerificationCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [status, setStatus] = useState<"checking" | "success" | "pending" | "failed">("checking");

  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to complete verification",
          variant: "destructive"
        });
        navigate("/login");
        return;
      }

      const verificationId = localStorage.getItem("veriff_session_id");
      
      if (!verificationId) {
        setStatus("failed");
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("check-verification", {
          body: { 
            verificationId,
            userId: user.id
          }
        });

        if (error) throw error;

        if (data.success) {
          if (data.status === "approved") {
            setStatus("success");
            
            // Send welcome email for verified workers
            await supabase.functions.invoke("send-welcome-email", {
              body: {
                name: user.name || user.user_metadata?.name || "User",
                email: user.email,
                role: user.user_metadata?.role || "worker",
                welcomeType: "verified"
              }
            });
            
            toast({
              title: "Verification successful",
              description: "Your identity has been verified successfully. Welcome to TaskHived!"
            });
          } else if (data.status === "declined" || data.status === "abandoned") {
            setStatus("failed");
            toast({
              title: "Verification failed",
              description: "Your verification was not successful. Please contact support or try again with a valid government-issued ID.",
              variant: "destructive"
            });
          } else {
            // In review or another state
            setStatus("pending");
            toast({
              title: "Verification in progress",
              description: "Your verification is being processed. We'll notify you when it's complete."
            });
          }
        } else {
          throw new Error("Failed to check verification status");
        }
      } catch (error: any) {
        console.error("Error checking verification:", error);
        setStatus("failed");
        toast({
          title: "Verification status check failed",
          description: error.message || "Failed to check verification status",
          variant: "destructive"
        });
      }
    };

    checkVerificationStatus();
  }, [user, navigate, toast]);

  const renderContent = () => {
    switch (status) {
      case "checking":
        return (
          <div className="flex flex-col items-center py-8">
            <Loader className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg">Checking verification status...</p>
          </div>
        );
      case "success":
        return (
          <div className="text-center py-8">
            <div className="mx-auto h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Verification Successful!</h2>
            <p className="mb-4 text-muted-foreground">Your identity has been verified successfully. You can now access all features of TaskHived.</p>
          </div>
        );
      case "pending":
        return (
          <div className="text-center py-8">
            <div className="mx-auto h-20 w-20 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Verification In Progress</h2>
            <p className="mb-4 text-muted-foreground">Your verification is being reviewed. We'll notify you once it's complete. You'll have full access to TaskHived after approval.</p>
          </div>
        );
      case "failed":
        return (
          <div className="text-center py-8">
            <div className="mx-auto h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Verification Failed</h2>
            <p className="mb-4 text-muted-foreground">We couldn't verify your identity. Please contact support or try again with a valid government-issued ID.</p>
          </div>
        );
    }
  };

  return (
    <Card className="max-w-md w-full mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Identity Verification</CardTitle>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button 
          onClick={() => navigate("/")}
          variant={status === "failed" ? "outline" : "default"}
        >
          {status === "failed" ? "Try Again" : "Back to Dashboard"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VerificationCallback;
