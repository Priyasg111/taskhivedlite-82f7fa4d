
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, DollarSign, Upload } from "lucide-react";
import AIVerification from "./AIVerification";

interface TaskCompletionFormProps {
  taskId: string;
  title: string;
  description: string;
  payment: number;
}

const TaskCompletionForm: React.FC<TaskCompletionFormProps> = ({
  taskId,
  title,
  description,
  payment,
}) => {
  const { toast } = useToast();
  const [submission, setSubmission] = useState("");
  const [verificationState, setVerificationState] = useState<
    "idle" | "verifying" | "success" | "failed"
  >("idle");
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [verificationScore, setVerificationScore] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!submission.trim()) {
      toast({
        title: "Empty submission",
        description: "Please provide your work before submitting.",
        variant: "destructive",
      });
      return;
    }
    
    // Start verification process simulation
    setVerificationState("verifying");
    
    // Simulate AI verification progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setVerificationProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        
        // Simulate verification result - typically this would be based on actual AI analysis
        const score = Math.floor(Math.random() * 31) + 70; // Random score between 70-100
        setVerificationScore(score);
        
        if (score >= 80) {
          setVerificationState("success");
          toast({
            title: "Verification successful!",
            description: `Your work has been verified with a score of ${score}%. Payment is being processed.`,
          });
        } else {
          setVerificationState("failed");
          toast({
            title: "Verification needs improvement",
            description: `Your submission scored ${score}%. Please review feedback and resubmit.`,
            variant: "destructive",
          });
        }
      }
    }, 300);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle>{title}</CardTitle>
            <div className="flex items-center bg-brand-blue/10 px-3 py-1 rounded-full text-brand-blue font-medium">
              <DollarSign className="h-4 w-4 mr-1" />
              {payment.toFixed(2)}
            </div>
          </div>
          <Badge variant="outline" className="mt-2">Task ID: {taskId}</Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Task Description:</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Submit Your Work</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label 
                  htmlFor="submission" 
                  className="block text-sm font-medium mb-2"
                >
                  Your Submission:
                </label>
                <Textarea
                  id="submission"
                  placeholder="Enter your work here. Be as detailed and accurate as possible for better verification scores."
                  className="min-h-[200px]"
                  value={submission}
                  onChange={(e) => setSubmission(e.target.value)}
                  disabled={verificationState === "verifying"}
                />
              </div>
              
              <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-6 border-gray-300">
                <div className="text-center space-y-2">
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <div className="flex text-sm leading-6 text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md bg-white font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        disabled={verificationState === "verifying"}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, PDF up to 10MB
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button">
              Save Draft
            </Button>
            <Button 
              type="submit"
              disabled={verificationState === "verifying" || !submission.trim()}
            >
              {verificationState === "idle" ? "Submit for Verification" : 
               verificationState === "verifying" ? "Verifying..." : 
               verificationState === "success" ? "Verified ✓" : 
               "Resubmit"}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {verificationState !== "idle" && (
        <AIVerification 
          state={verificationState} 
          progress={verificationProgress}
          score={verificationScore}
        />
      )}
    </div>
  );
};

export default TaskCompletionForm;
