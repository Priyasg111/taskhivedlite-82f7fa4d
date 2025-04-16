
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const VeriffVerification = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const startVerification = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to verify your identity",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("verify-identity", {
        body: { userId: user.id }
      });

      if (error) throw error;

      if (data.success && data.verificationUrl) {
        // Store verification ID in localStorage for checking status later
        localStorage.setItem("veriff_session_id", data.verificationId);
        
        // Redirect to Veriff
        window.location.href = data.verificationUrl;
      } else {
        throw new Error("Failed to initiate verification");
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      toast({
        title: "Verification failed",
        description: error.message || "Failed to start verification process",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Identity Verification</CardTitle>
        <CardDescription>
          Verify your identity to unlock all features and capabilities on TaskHived
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                <circle cx="9" cy="9" r="2"></circle>
                <path d="M15 13h-2"></path>
                <path d="M15 9h-2"></path>
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Simple verification process</h3>
              <p className="text-sm text-muted-foreground">Complete in just a few minutes</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Fast verification</h3>
              <p className="text-sm text-muted-foreground">Start working immediately after approval</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Secure and compliant</h3>
              <p className="text-sm text-muted-foreground">Your data is protected with bank-grade security</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={startVerification}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Processing..." : "Start Verification"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VeriffVerification;
