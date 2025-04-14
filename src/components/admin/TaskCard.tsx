
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { Task } from "@/types/task";

interface TaskCardProps {
  task: Task;
  onApprove: (taskId: string) => void;
  onReject: (taskId: string) => void;
  processingTask: string | null;
  type: 'pending' | 'verified' | 'rejected';
}

const TaskCard = ({ task, onApprove, onReject, processingTask, type }: TaskCardProps) => {
  const isProcessing = processingTask === task.id;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium">{task.title}</h3>
            <p className="text-sm text-muted-foreground">
              {task.client_name && `Client: ${task.client_name}`}
              {task.client_email && ` (${task.client_email})`}
            </p>
          </div>
          <Badge variant={
            type === 'pending' ? 'outline' :
            type === 'verified' ? 'secondary' : 'destructive'
          }>
            {type === 'pending' ? 'Pending' :
             type === 'verified' ? 'Verified' : 'Rejected'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div>
            <div className="text-sm font-medium">Worker</div>
            <div className="text-sm">
              {task.worker_name || 'Unknown worker'}
              {task.worker_email && ` (${task.worker_email})`}
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium">Description</div>
            <p className="text-sm text-muted-foreground">
              {task.description}
            </p>
          </div>
          
          <div className="flex gap-4">
            <div>
              <div className="text-sm font-medium">Payment</div>
              <div className="text-sm">${task.payment.toFixed(2)}</div>
            </div>
            
            <div>
              <div className="text-sm font-medium">Time Taken</div>
              <div className="text-sm flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {task.time_taken ? `${task.time_taken} minutes` : 'Not recorded'}
              </div>
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium">Payment Status</div>
            <Badge variant={task.payment_status === 'paid' ? 'outline' : 'secondary'} className="mt-1">
              {task.payment_status === 'paid' ? 'Paid' : 'Pending'}
            </Badge>
          </div>
        </div>
      </CardContent>
      
      {type === 'pending' && (
        <CardFooter className="bg-muted/20 border-t flex justify-end gap-2">
          <Button 
            variant="outline" 
            disabled={isProcessing}
            onClick={() => onReject(task.id)}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Reject
          </Button>
          <Button 
            disabled={isProcessing}
            onClick={() => onApprove(task.id)}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Approve
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default TaskCard;
