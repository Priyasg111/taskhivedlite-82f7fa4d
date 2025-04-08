
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Upload, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface TaskCompletionFormProps {
  id: string;
  title: string;
  description: string;
  payment: number;
}

export const TaskCompletionForm = ({ id, title, description, payment }: TaskCompletionFormProps) => {
  const [response, setResponse] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!response.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a response to complete this task.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // This would be an API call in a real application
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast({
        title: "Task submitted successfully!",
        description: "Your submission will be verified by our AI system.",
      });
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
        <CardContent className="text-center">
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mb-4">
            <p className="text-lg font-medium text-amber-900">Payment of ${payment.toFixed(2)} is pending verification</p>
            <p className="text-sm text-amber-700">You will be notified once the verification is complete.</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="outline" onClick={() => window.location.href = "/complete-tasks"}>
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
          <CardTitle>{title}</CardTitle>
          <CardDescription className="text-muted-foreground">
            Task ID: {id} • Payment: ${payment.toFixed(2)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Task Description</h3>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">{description}</p>
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
