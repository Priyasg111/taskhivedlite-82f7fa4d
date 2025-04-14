
import { Task } from "@/types/task";
import TaskCard from "./TaskCard";

interface TaskListProps {
  tasks: Task[];
  status: 'pending' | 'verified' | 'rejected';
  loading: boolean;
  processingTask: string | null;
  onApprove: (taskId: string) => void;
  onReject: (taskId: string) => void;
}

const TaskList = ({ tasks, status, loading, processingTask, onApprove, onReject }: TaskListProps) => {
  // Filter tasks based on status
  let filteredTasks = tasks;
  if (status === 'pending') {
    filteredTasks = tasks.filter(t => t.status === "completed");
  } else if (status === 'verified') {
    filteredTasks = tasks.filter(t => t.status === "verified");
  } else if (status === 'rejected') {
    filteredTasks = tasks.filter(t => t.status === "rejected");
  }

  if (loading) {
    return <div className="text-center p-4">Loading tasks...</div>;
  }

  if (filteredTasks.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-4">
        No {status} tasks
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredTasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          onApprove={onApprove}
          onReject={onReject}
          processingTask={processingTask}
          type={status}
        />
      ))}
    </div>
  );
};

export default TaskList;
