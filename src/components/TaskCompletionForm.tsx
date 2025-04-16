
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Upload, AlertCircle, Clock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import AIVerification from "@/components/AIVerification";
import { getTaskById, submitCompletedTask } from "@/utils/taskUtils";
import BadgeIcon from "./user/BadgeIcon";
import { Task, TaskSubmission } from "@/types/task";
import { useQuery } from "@tanstack/react-query";

interface TaskCompletionFormProps {
  id?: string;
  title?: string;
  description?: string;
  payment?: number;
}

const TaskCompletionForm = ({ id, title, description, payment }: TaskCompletionFormProps) => {
  const params = useParams();
  const taskId = id || params.taskId;
  const [comment, setComment] = useState("");
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
  const [userBadge, setUserBadge] = useState<string | null>(null);
  const [badgeUpgraded, setBadgeUpgraded] = useState(false);
  const [task, setTask] = useState<Task | null>(null);
  
  const { toast } = useToast();
  const { user, updateExperience } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // If taskId is provided, fetch the task details
  const { data: fetchedTask, isLoading: isLoadingTask } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => taskId ? getTaskById(taskId) : null,
    enabled: !!taskId && !id, // Only fetch if taskId exists and props were not provided
  });

  // Use fetched task or props
  useEffect(() => {
    if (fetchedTask) {
      setTask(fetchedTask);
    } else if (id && title && description && payment) {
      setTask({
        id,
        title,
        description,
        payment,
        client_id: '',
        worker_id: user?.id || null,
        status: 'in_progress',
        payment_status: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  }, [fetchedTask, id, title, description, payment, user]);
  
  // Load user badge on component mount
  useEffect(() => {
    const fetchUserBadge = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('badge_level')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        setUserBadge(data?.badge_level || 'beginner');
      } catch (error) {
        console.error("Error fetching user badge:", error);
      }
    };
    
    fetchUserBadge();
  }, [user]);

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
    if (e.target.files && e.target.files.length > 0) {
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
    
    if (!task?.id) {
      toast({
        title: "Task Error",
        description: "Cannot identify the task to submit.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    setEndTime(new Date());
    
    try {
      const submission: TaskSubmission = {
        task_id: task.id,
        comment,
        file: files.length > 0 ? files[0] : undefined
      };
      
      // Show progress animation
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.floor(Math.random() * 8) + 3;
        if (progress >= 100) {
          clearInterval(progressInterval);
          progress = 99; // Keep at 99% until verification is complete
        }
        setVerificationProgress(progress);
      }, 500);
      
      const result = await submitCompletedTask(submission);
      
      clearInterval(progressInterval);
      setVerificationProgress(100);
      setIsSubmitted(true);
      setShowVerification(true);
      
      if (result.status === 'completed') {
        setVerificationState("success");
        updateExperience(1); // Add 1 hour of experience
      } else if (result.status === 'under_review') {
        setVerificationState("verifying");
        toast({
          title: "Submission Under Review",
          description: "Your task submission is being reviewed.",
        });
      } else {
        setVerificationState("failed");
        toast({
          title: "Submission Failed",
          description: result.message || "Your submission did not meet the required criteria.",
          variant: "destructive",
        });
      }
      
      setTimeSpent(calculateTimeSpent());
      
    } catch (error: any) {
      console.error("Error submitting task:", error);
      toast({
        title: "Submission error",
        description: error.message || "There was an error submitting your task.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  if (isLoadingTask) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading task...</span>
      </div>
    );
  }

  if (!task && taskId) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-center p-6">
              <AlertCircle className="h-16 w-16 text-destructive mb-4" />
              <h2 className="text-2xl font-bold mb-2">Task Not Found</h2>
              <p className="text-muted-foreground mb-6">The requested task could not be found or you don't have permission to view it.</p>
              <Button onClick={() => navigate("/complete-tasks")}>Browse Available Tasks</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <p className="text-lg font-medium text-amber-900">Payment of ${task?.payment?.toFixed(2)} is pending verification</p>
            <p className="text-sm text-amber-700">You will be notified once the verification is complete.</p>
          </div>
          
          {badgeUpgraded && userBadge && (
            <div className="bg-green-50 border border-green-100 rounded-lg p-4 mt-4">
              <div className="flex items-center justify-center gap-3 mb-2">
                <BadgeIcon level={userBadge} size="lg" showLabel={true} />
              </div>
              <p className="text-lg font-medium text-green-900">Congratulations! You've leveled up!</p>
              <p className="text-sm text-green-700">Keep completing tasks to reach even higher levels.</p>
            </div>
          )}
          
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
          <CardTitle>{task?.title}</CardTitle>
          <CardDescription className="text-muted-foreground">
            Task ID: {task?.id} • Payment: ${task?.payment?.toFixed(2)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Task Description</h3>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">{task?.description}</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="comment" className="text-sm font-medium">
                Your Comment
              </label>
              <Textarea
                id="comment"
                placeholder="Provide your comments or completion details here..."
                className="min-h-[150px]"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="file" className="text-sm font-medium">
                Attachment (optional)
              </label>
              <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop or click to upload a file
                </p>
                <input
                  ref={fileInputRef}
                  id="file"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose File
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
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    Submitting...
                  </>
                ) : (
                  "Submit Task"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskCompletionForm;
