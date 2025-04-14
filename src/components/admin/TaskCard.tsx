
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, X } from "lucide-react";
import { Task } from "@/types/task";

interface TaskCardProps {
  task: Task;
  onApprove: (taskId: string) => void;
  onReject: (taskId: string) => void;
  processingTask: string | null;
  type: 'pending' | 'verified' | 'rejected';
}

const TaskCard = ({ task, onApprove, onReject, processingTask, type }: TaskCardProps) => {
  return (
    <div key={task.id} className="border rounded-md p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-medium">{task.title}</h4>
          <p className="text-sm text-muted-foreground">
            By {task.worker_name || "Unknown worker"}
          </p>
        </div>
        {type === 'pending' && <Badge>Pending Review</Badge>}
        {type === 'verified' && (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        )}
        {type === 'rejected' && (
          <Badge variant="destructive">
            <X className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )}
      </div>
      
      {(type === 'pending' || type === 'verified') && (
        <div className="mb-4">
          <p className="text-sm">
            Client: {task.client_name || "Unknown"}
          </p>
          <p className="text-sm">
            Payment: ${task.payment?.toFixed(2) || "0.00"}
          </p>
          {type === 'pending' && (
            <p className="text-sm">
              Time Taken: {task.time_taken || "0"} minutes
            </p>
          )}
          {type === 'verified' && (
            <p className="text-sm">
              Payment Status: {task.payment_status || "pending"}
            </p>
          )}
        </div>
      )}
      
      {type === 'pending' && !task.worker_wallet_address && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-4 flex items-center">
          <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
          <p className="text-xs text-yellow-800">
            Worker has not connected a wallet yet. Approval will be on hold.
          </p>
        </div>
      )}
      
      {type === 'pending' && (
        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onReject(task.id)}
            disabled={!!processingTask}
          >
            {processingTask === task.id ? "Processing..." : "Reject"}
          </Button>
          <Button 
            size="sm"
            onClick={() => onApprove(task.id)}
            disabled={!!processingTask || !task.worker_wallet_address}
          >
            {processingTask === task.id ? "Processing..." : "Approve & Pay"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
