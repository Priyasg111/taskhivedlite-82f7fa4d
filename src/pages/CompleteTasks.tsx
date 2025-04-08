
import NavBar from "@/components/NavBar";
import TaskList from "@/components/TaskList";
import TaskCompletionForm from "@/components/TaskCompletionForm";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const CompleteTasks = () => {
  const [selectedTask, setSelectedTask] = useState<{
    id: string;
    title: string;
    description: string;
    payment: number;
  } | null>(null);
  
  // This would be pulled from API in real app
  const sampleTask = {
    id: "task-1",
    title: "Data Labeling for AI Training",
    description: "Label 50 images of street scenes for our autonomous driving AI. Identify pedestrians, vehicles, road signs, and traffic lights. Ensure accuracy in your annotations as these will be used to train critical safety systems.",
    payment: 15.00,
  };
  
  const selectSampleTask = () => {
    setSelectedTask(sampleTask);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 container py-8 px-4">
        {selectedTask ? (
          <div>
            <Button 
              variant="ghost" 
              className="mb-6"
              onClick={() => setSelectedTask(null)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tasks
            </Button>
            <TaskCompletionForm {...selectedTask} />
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-3xl font-bold">Complete Tasks</h1>
              <p className="text-muted-foreground mt-2">
                Browse and work on available tasks. Get paid once your submission is verified by AI.
              </p>
            </div>
            <Button onClick={selectSampleTask} className="mb-6">Open Sample Task</Button>
            <TaskList />
          </>
        )}
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

export default CompleteTasks;
