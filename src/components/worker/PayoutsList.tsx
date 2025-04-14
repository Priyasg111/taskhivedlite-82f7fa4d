
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDown } from "lucide-react";
import { Task } from "@/types/task";

interface PayoutsListProps {
  pendingPayouts: Task[];
}

const PayoutsList = ({ pendingPayouts }: PayoutsListProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Pending Payouts</CardTitle>
      </CardHeader>
      <CardContent>
        {pendingPayouts.length > 0 ? (
          <div className="space-y-4">
            {pendingPayouts.map((task) => (
              <div key={task.id} className="flex items-center justify-between border-b pb-4">
                <div>
                  <div className="font-medium">{task.title}</div>
                  <div className="text-sm text-muted-foreground">
                    For client: {task.client_name || "Unknown"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-green-600">${task.payment.toFixed(2)}</div>
                  <Badge variant="outline" className="text-xs">Verified - Pending Payment</Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <ArrowDown className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p>No pending payouts</p>
            <p className="text-sm mt-2">Complete tasks to earn USDC</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PayoutsList;
