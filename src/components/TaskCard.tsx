
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Clock, CheckCircle } from "lucide-react";

export interface TaskCardProps {
  id: string;
  title: string;
  description: string;
  payment: number;
  estimatedTime: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: 'Open' | 'In Progress' | 'Completed' | 'Verified';
  onClick?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  id,
  title,
  description,
  payment,
  estimatedTime,
  category,
  difficulty,
  status,
  onClick
}) => {
  const difficultyColor = {
    Easy: "bg-green-100 text-green-700",
    Medium: "bg-yellow-100 text-yellow-700",
    Hard: "bg-red-100 text-red-700"
  };
  
  const statusColor = {
    Open: "bg-blue-100 text-blue-700",
    "In Progress": "bg-purple-100 text-purple-700",
    Completed: "bg-orange-100 text-orange-700",
    Verified: "bg-green-100 text-green-700"
  };

  return (
    <Card className="task-card">
      <CardHeader className="px-6 pt-6 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline">{category}</Badge>
              <Badge className={difficultyColor[difficulty]}>{difficulty}</Badge>
              <Badge className={statusColor[status]}>{status}</Badge>
            </div>
          </div>
          <div className="flex items-center bg-brand-blue/10 px-3 py-1 rounded-full text-brand-blue font-medium">
            <DollarSign className="h-4 w-4 mr-1" />
            {payment.toFixed(2)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-6 py-2">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>
      </CardContent>
      <CardFooter className="px-6 pt-2 pb-6 flex justify-between">
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="h-4 w-4 mr-1" />
          {estimatedTime}
        </div>
        <Button onClick={onClick}>
          {status === 'Open' ? 'Start Task' : status === 'In Progress' ? 'Submit Work' : status === 'Completed' ? 'View Status' : 'View Details'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TaskCard;
