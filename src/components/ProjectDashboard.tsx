
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";

// Sample project data - would come from Supabase in a real implementation
const sampleProjects = [
  {
    id: "proj-1",
    title: "Data Annotation Project",
    description: "Annotate images for machine learning dataset",
    progress: 65,
    tasks: 20,
    completedTasks: 13,
    dueDate: "2025-05-15",
    priority: "high",
  },
  {
    id: "proj-2",
    title: "Content Moderation",
    description: "Review and moderate user-generated content",
    progress: 30,
    tasks: 50,
    completedTasks: 15,
    dueDate: "2025-04-30",
    priority: "medium",
  },
  {
    id: "proj-3",
    title: "Translation Quality Check",
    description: "Review machine translations for accuracy",
    progress: 80,
    tasks: 100,
    completedTasks: 80,
    dueDate: "2025-04-20",
    priority: "low",
  },
];

const ProjectDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("ongoing");

  if (!user) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Project Dashboard</h2>
        <p className="text-muted-foreground mb-6">
          Please log in to view and manage your projects.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Project Dashboard</h2>
      </div>

      <Tabs defaultValue="ongoing" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="ongoing">Ongoing Projects</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ongoing">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleProjects.map((project) => (
              <Card key={project.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <Badge className={
                      project.priority === "high" 
                        ? "bg-red-100 text-red-800" 
                        : project.priority === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                    }>
                      {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                    </Badge>
                  </div>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <div>
                        <p className="text-muted-foreground">Tasks</p>
                        <p className="font-medium">{project.completedTasks}/{project.tasks}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Due Date</p>
                        <p className="font-medium">{new Date(project.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <button className="text-xs px-2 py-1 bg-brand-blue/10 text-brand-blue rounded hover:bg-brand-blue/20 transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="completed">
          <div className="text-center py-8">
            <p className="text-muted-foreground">No completed projects yet.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="upcoming">
          <div className="text-center py-8">
            <p className="text-muted-foreground">No upcoming projects yet.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDashboard;
