
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Award, Star, Shield, AlertCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface UserBadgeProps {
  badgeLevel: string;
  verifiedTasks: number;
  avgScore: number;
  recentComment?: string;
}

const UserBadge: React.FC<UserBadgeProps> = ({
  badgeLevel,
  verifiedTasks,
  avgScore,
  recentComment,
}) => {
  // Calculate next badge threshold and progress
  const getBadgeProgress = () => {
    switch (badgeLevel) {
      case "beginner":
        return {
          current: verifiedTasks,
          next: "intermediate",
          required: 5,
          progress: (verifiedTasks / 5) * 100,
          remaining: 5 - verifiedTasks,
        };
      case "intermediate":
        return {
          current: verifiedTasks,
          next: "advanced",
          required: 20,
          progress: (verifiedTasks / 20) * 100,
          remaining: 20 - verifiedTasks,
        };
      case "advanced":
        return {
          current: verifiedTasks,
          next: "expert",
          required: 50,
          progress: (verifiedTasks / 50) * 100,
          remaining: 50 - verifiedTasks,
        };
      default:
        return {
          current: verifiedTasks,
          next: null,
          required: 50,
          progress: 100,
          remaining: 0,
        };
    }
  };

  const badgeProgress = getBadgeProgress();

  const getBadgeIcon = () => {
    switch (badgeLevel) {
      case "beginner":
        return <Shield className="h-6 w-6 text-blue-500" />;
      case "intermediate":
        return <Star className="h-6 w-6 text-green-500" />;
      case "advanced":
        return <Award className="h-6 w-6 text-purple-500" />;
      case "expert":
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      default:
        return <Shield className="h-6 w-6 text-blue-500" />;
    }
  };

  const getBadgeColor = () => {
    switch (badgeLevel) {
      case "beginner":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "intermediate":
        return "bg-green-100 text-green-800 border-green-200";
      case "advanced":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "expert":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Your Professional Level</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          {getBadgeIcon()}
          <div className="flex-1">
            <Badge className={`${getBadgeColor()} capitalize text-sm py-1 px-2`}>
              {badgeLevel}
            </Badge>
            <div className="text-sm text-muted-foreground mt-1">
              Based on your task performance
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Verified Tasks: {verifiedTasks}</span>
            <span>Avg. Score: {avgScore.toFixed(2)}/5</span>
          </div>
          
          {badgeProgress.next && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="w-full">
                  <div className="space-y-1">
                    <Progress value={badgeProgress.progress} />
                    <div className="text-xs text-muted-foreground text-center">
                      {badgeProgress.remaining} tasks away from{" "}
                      <span className="capitalize font-medium">
                        {badgeProgress.next}
                      </span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Complete more verified tasks to level up</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {recentComment && (
          <div className="mt-4 pt-4 border-t text-sm">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Recent Feedback</span>
            </div>
            <p className="text-sm text-muted-foreground">{recentComment}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserBadge;
