
import { ArrowRight, FileText, DollarSign, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const TaskActionButtons = () => {
  const navigate = useNavigate();
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
      <Button 
        className="h-24 text-lg justify-start px-6" 
        onClick={() => navigate("/complete-tasks")}
      >
        <ArrowRight className="mr-2" />
        Browse New Tasks
      </Button>
      
      <Button 
        className="h-24 text-lg justify-start px-6" 
        variant="outline"
        onClick={() => navigate("/worker-dashboard")}
      >
        <FileText className="mr-2" />
        My Submissions
      </Button>
      
      <Button 
        className="h-24 text-lg justify-start px-6" 
        variant="outline"
        onClick={() => navigate("/payments")}
      >
        <DollarSign className="mr-2" />
        Earnings Summary
      </Button>
      
      <Button 
        className="h-24 text-lg justify-start px-6" 
        variant="outline"
        onClick={() => {}}
      >
        <User className="mr-2" />
        Edit Profile
      </Button>
    </div>
  );
};

export default TaskActionButtons;
