
import React from "react";
import TaskOverviewCards from "./TaskOverviewCards";
import TaskActionButtons from "./TaskActionButtons";
import ActivityFeed from "./ActivityFeed";
import TasksTable from "./TasksTable";
import { TaskActivity, TaskItem } from "@/types/worker";

interface TaskRoomContentProps {
  firstName: string;
  metrics: {
    activeTasks: number;
    completedTasks: number;
    pendingReviews: number;
  };
  activities: TaskActivity[];
  tasks: TaskItem[];
}

const TaskRoomContent: React.FC<TaskRoomContentProps> = ({
  firstName,
  metrics,
  activities,
  tasks,
}) => {
  return (
    <main className="flex-1 container py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Welcome, {firstName} 👋</h1>
      <p className="text-muted-foreground mb-8">Your personal task dashboard</p>
      
      <TaskOverviewCards metrics={metrics} />
      <TaskActionButtons />
      
      <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
      <ActivityFeed activities={activities} />
      
      <h2 className="text-2xl font-bold mb-4">My Tasks</h2>
      <TasksTable tasks={tasks} />
    </main>
  );
};

export default TaskRoomContent;
