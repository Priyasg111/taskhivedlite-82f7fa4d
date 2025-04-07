
import { useState } from "react";
import TaskCard, { TaskCardProps } from "./TaskCard";
import { useToast } from "@/components/ui/use-toast";

// Sample task data
const sampleTasks: TaskCardProps[] = [
  {
    id: "task-1",
    title: "Data Labeling for AI Training",
    description: "Label 50 images of street scenes for our autonomous driving AI. Identify pedestrians, vehicles, road signs, and traffic lights.",
    payment: 15.00,
    estimatedTime: "30-45 min",
    category: "AI Training",
    difficulty: "Easy",
    status: "Open"
  },
  {
    id: "task-2",
    title: "Social Media Content Review",
    description: "Review a batch of 100 social media posts and flag any inappropriate content according to our community guidelines.",
    payment: 18.50,
    estimatedTime: "45-60 min",
    category: "Content Moderation",
    difficulty: "Medium",
    status: "Open"
  },
  {
    id: "task-3",
    title: "Technical Documentation Proofreading",
    description: "Proofread 5 pages of technical documentation for our API, checking for grammar, clarity, and technical accuracy.",
    payment: 25.00,
    estimatedTime: "60 min",
    category: "Documentation",
    difficulty: "Medium",
    status: "In Progress"
  },
  {
    id: "task-4",
    title: "Audio Transcription Quality Check",
    description: "Compare AI-generated transcriptions with original audio recordings and correct any inaccuracies.",
    payment: 22.75,
    estimatedTime: "50-70 min",
    category: "Transcription",
    difficulty: "Hard",
    status: "Completed"
  },
  {
    id: "task-5",
    title: "Product Categorization for E-commerce",
    description: "Assign appropriate categories and tags to 200 product listings for an e-commerce website.",
    payment: 19.25,
    estimatedTime: "40-60 min",
    category: "E-commerce",
    difficulty: "Medium",
    status: "Verified"
  },
];

const TaskList = () => {
  const [tasks, setTasks] = useState<TaskCardProps[]>(sampleTasks);
  const { toast } = useToast();

  const handleTaskClick = (taskId: string) => {
    // In a real app, this would navigate to task detail page or show a modal
    toast({
      title: "Task selected",
      description: `You selected task ID: ${taskId}`,
    });
    
    // Update task status for demo purposes
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        if (task.status === "Open") return { ...task, status: "In Progress" };
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
