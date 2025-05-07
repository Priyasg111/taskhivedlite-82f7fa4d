
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ActivityItem {
  id: string;
  message: string;
  created_at: string;
  task_name?: string;
  task_id?: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  return (
    <div className="space-y-4 mb-8">
      {activities.length > 0 ? (
        activities.map(activity => (
          <div key={activity.id} className="flex items-start gap-4 p-3 border rounded-lg">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {activity.task_name?.substring(0, 2) || 'TA'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">{activity.message}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(activity.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-muted-foreground">No recent activity to display</p>
      )}
    </div>
  );
};

export default ActivityFeed;
