
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Upload, AlertCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import AIVerification from "@/components/AIVerification";

interface TaskCompletionFormProps {
  id?: string;
  title?: string;
  description?: string;
  payment?: number;
}

const TaskCompletionForm = ({ id, title, description, payment }: TaskCompletionFormProps) => {
  const params = useParams();
  const taskId = id || params.taskId;
  const [response, setResponse] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [timeSpent, setTimeSpent] = useState<string>("");
  const [verificationState, setVerificationState] = useState<"verifying" | "success" | "failed">("verifying");
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [verificationScore, setVerificationScore] = useState(0);
  const [showVerification, setShowVerification] = useState(false);
  
  const { toast } = useToast();
  const { user, updateExperience } = useAuth();
  const navigate = useNavigate();

  // In a real app, you would fetch the task details based on the taskId
  // For this demo, we'll use sample data when not provided via props
  const taskTitle = title || "Data Labeling for AI Training";
  const taskDescription = description || "Label 50 images of street scenes for our autonomous driving AI. Identify pedestrians, vehicles, road signs, and traffic lights.";
  const taskPayment = payment || 15.00;

  // Start tracking time when the component loads
  useEffect(() => {
    setStartTime(new Date());
    
    return () => {
      // Clean up if the component unmounts
      if (startTime && !endTime) {
        const now = new Date();
        const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        console.log(`Task was open for ${diff} seconds`);
      }
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const calculateTimeSpent = () => {
    if (!startTime || !endTime) return "";
    
    const diffMs = endTime.getTime() - startTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const remainingMins = diffMins % 60;
    
    if (diffHrs > 0) {
      return `${diffHrs}h ${remainingMins}m`;
    } else {
      return `${diffMins}m`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to submit tasks",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    
    if (!response.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a response to complete this task.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    setEndTime(new Date());
    
    // This would be an API call in a real application
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setShowVerification(true);
      
      // Simulate AI verification process
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 5;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          // Determine verification success based on various factors
          const responseQuality = response.length > 50 ? 1 : 0.5; // Simple quality check
          const filesQuality = files.length > 0 ? 1 : 0.7; // Check if files were uploaded
          
          // Get time taken in minutes
          const timeInMinutes = startTime && endTime ? 
            (endTime.getTime() - startTime.getTime()) / 60000 : 0;
            
          // Penalize if too quick (less than 1 minute) or too long (more than 30 minutes)
          let timeQuality = 1;
          if (timeInMinutes < 1) timeQuality = 0.7;
          else if (timeInMinutes > 30) timeQuality = 0.8;
          
          // Calculate final score (0-100)
          const finalScore = Math.floor((responseQuality * 0.5 + filesQuality * 0.3 + timeQuality * 0.2) * 100);
          setVerificationScore(finalScore);
          
          // Set state based on score
          if (finalScore >= 70) {
            setVerificationState("success");
            
            // Add experience hours based on difficulty and time taken (estimation)
            const experienceGained = Math.max(1, Math.min(Math.floor(timeInMinutes / 15), 3));
            updateExperience(experienceGained);
          } else {
            setVerificationState("failed");
          }
          
          setTimeSpent(calculateTimeSpent());
        } else {
          setVerificationProgress(progress);
        }
      }, 500);
      
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-center text-center mb-4">
            <CheckCircle className="text-green-500 h-12 w-12" />
          </div>
          <CardTitle className="text-center text-2xl">Task Submitted Successfully!</CardTitle>
          <CardDescription className="text-center pt-2">
            Your work has been submitted and is being verified by our AI systems.
            You will receive payment once verification is complete.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          {timeSpent && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-500 mr-2" />
              <p className="text-lg font-medium text-blue-900">Time spent: {timeSpent}</p>
            </div>
          )}
          
          {showVerification && (
            <div className="mt-6">
              <AIVerification 
                state={verificationState}
                progress={verificationProgress}
                score={verificationScore}
              />
            </div>
          )}
          
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mb-4">
            <p className="text-lg font-medium text-amber-900">Payment of ${taskPayment.toFixed(2)} is pending verification</p>
            <p className="text-sm text-amber-700">You will be notified once the verification is complete.</p>
          </div>
          
          {verificationState === "success" && (
            <div className="bg-green-50 border border-green-100 rounded-lg p-4 mt-4">
              <p className="text-lg font-medium text-green-900">+1 hour of experience earned!</p>
              <p className="text-sm text-green-700">You now have {user?.experience} hours of total experience.</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="outline" onClick={() => navigate("/complete-tasks")}>
            Find More Tasks
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{taskTitle}</CardTitle>
          <CardDescription className="text-muted-foreground">
            Task ID: {taskId} • Payment: ${taskPayment.toFixed(2)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Task Description</h3>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">{taskDescription}</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="response" className="text-sm font-medium">
                Your Response
              </label>
              <Textarea
                id="response"
                placeholder="Provide your response or completion details here..."
                className="min-h-[150px]"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="files" className="text-sm font-medium">
                Attachments (optional)
              </label>
              <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop or click to upload files
                </p>
                <input
                  id="files"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => document.getElementById("files")?.click()}
                >
                  Choose Files
                </Button>
                {files.length > 0 && (
                  <div className="mt-4 space-y-2 text-left">
                    {files.map((file, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {file.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg flex gap-3">
              <Clock className="text-amber-500 h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Time Tracking</p>
                <p>Your time on this task is being tracked. AI verification will consider the time taken to complete the task.</p>
              </div>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg flex gap-3">
              <AlertCircle className="text-amber-500 h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Important</p>
                <p>All submissions are verified by our AI system. Ensure your work meets the requirements specified in the task description.</p>
              </div>
            </div>
            <div className="pt-4">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Task"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskCompletionForm;
