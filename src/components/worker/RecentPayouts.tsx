
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

const RecentPayouts = () => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Recent Payouts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground py-8">
          <DollarSign className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
          <p>No recent payouts</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentPayouts;
