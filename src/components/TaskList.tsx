
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TaskCard, { TaskCardProps } from "./TaskCard";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Button } from "./ui/button";

// Sample task data with experience requirements
const sampleTasks: TaskCardProps[] = [
  {
    id: "task-1",
    title: "Data Labeling for AI Training",
    description: "Label 50 images of street scenes for our autonomous driving AI. Identify pedestrians, vehicles, road signs, and traffic lights.",
    payment: 15.00,
    estimatedTime: "30-45 min",
    category: "AI Training",
    difficulty: "Easy",
    status: "Open",
    requiredExperience: 0 // No experience required
  },
  {
    id: "task-2",
    title: "Social Media Content Review",
    description: "Review a batch of 100 social media posts and flag any inappropriate content according to our community guidelines.",
    payment: 18.50,
    estimatedTime: "45-60 min",
    category: "Content Moderation",
    difficulty: "Medium",
    status: "Open",
    requiredExperience: 5 // 5 hours required
  },
  {
    id: "task-3",
    title: "Technical Documentation Proofreading",
    description: "Proofread 5 pages of technical documentation for our API, checking for grammar, clarity, and technical accuracy.",
    payment: 25.00,
    estimatedTime: "60 min",
    category: "Documentation",
    difficulty: "Medium",
    status: "In Progress",
    requiredExperience: 10 // 10 hours required
  },
  {
    id: "task-4",
    title: "Audio Transcription Quality Check",
    description: "Compare AI-generated transcriptions with original audio recordings and correct any inaccuracies.",
    payment: 22.75,
    estimatedTime: "50-70 min",
    category: "Transcription",
    difficulty: "Hard",
    status: "Completed",
    requiredExperience: 15 // 15 hours required
  },
  {
    id: "task-5",
    title: "Product Categorization for E-commerce",
    description: "Assign appropriate categories and tags to 200 product listings for an e-commerce website.",
    payment: 19.25,
    estimatedTime: "40-60 min",
    category: "E-commerce",
    difficulty: "Medium",
    status: "Verified",
    requiredExperience: 8 // 8 hours required
  },
];

const TaskList = () => {
  const [tasks, setTasks] = useState<TaskCardProps[]>(sampleTasks);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleTaskClick = (taskId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to work on tasks",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    
    // Find the task
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Check if user has enough experience
    if (task.status === "Open" && user.experience < task.requiredExperience) {
      toast({
        title: "Insufficient experience",
        description: `This task requires ${task.requiredExperience} hours of experience. You currently have ${user.experience} hours.`,
        variant: "destructive",
      });
      return;
    }
    
    // Update task status for demo purposes
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        if (task.status === "Open") {
          navigate(`/complete-tasks/${taskId}`);
          return { ...task, status: "In Progress" };
        }
        if (task.status === "In Progress") return { ...task, status: "Completed" };
        if (task.status === "Completed") return { ...task, status: "Verified" };
      }
      return task;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Available Tasks</h2>
        {!user && (
          <Button onClick={() => navigate("/signup")} className="bg-brand-blue hover:bg-brand-blue/90">
            Sign Up to Start Working
          </Button>
        )}
        <div className="space-x-2">
          <select className="border rounded-md p-2 text-sm bg-background">
            <option value="">All Categories</option>
            <option value="AI Training">AI Training</option>
            <option value="Content Moderation">Content Moderation</option>
            <option value="Documentation">Documentation</option>
            <option value="Transcription">Transcription</option>
            <option value="E-commerce">E-commerce</option>
          </select>
          <select className="border rounded-md p-2 text-sm bg-background">
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <select className="border rounded-md p-2 text-sm bg-background">
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Verified">Verified</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <TaskCard 
            key={task.id} 
            {...task} 
            onClick={() => handleTaskClick(task.id)} 
          />
        ))}
      </div>
    </div>
  );
};

export default TaskList;
