
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface TaskOverviewCardsProps {
  metrics: {
    activeTasks: number;
    completedTasks: number;
    pendingReviews: number;
  };
}

const TaskOverviewCards: React.FC<TaskOverviewCardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Active Tasks</CardTitle>
          <CardDescription>Tasks currently assigned</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{metrics.activeTasks}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Completed Tasks</CardTitle>
          <CardDescription>Successfully verified tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{metrics.completedTasks}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Pending Reviews</CardTitle>
          <CardDescription>Tasks waiting for verification</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{metrics.pendingReviews}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskOverviewCards;
