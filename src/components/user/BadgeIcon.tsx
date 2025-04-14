
import React from "react";
import { Shield, Star, Award, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface BadgeIconProps {
  level: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const BadgeIcon: React.FC<BadgeIconProps> = ({
  level,
  size = "md",
  showLabel = false,
  className,
}) => {
  const getIconSize = () => {
    switch (size) {
      case "sm":
        return "h-4 w-4";
      case "lg":
        return "h-8 w-8";
      default:
        return "h-6 w-6";
    }
  };

  const getBadgeDetails = () => {
    switch (level) {
      case "beginner":
        return {
          icon: <Shield className={cn(getIconSize(), "text-blue-500")} />,
          label: "Beginner",
          color: "text-blue-600 bg-blue-100",
        };
      case "intermediate":
        return {
          icon: <Star className={cn(getIconSize(), "text-green-500")} />,
          label: "Intermediate",
          color: "text-green-600 bg-green-100",
        };
      case "advanced":
        return {
          icon: <Award className={cn(getIconSize(), "text-purple-500")} />,
          label: "Advanced",
          color: "text-purple-600 bg-purple-100",
        };
      case "expert":
        return {
          icon: <Trophy className={cn(getIconSize(), "text-yellow-500")} />,
          label: "Expert",
          color: "text-yellow-600 bg-yellow-100",
        };
      default:
        return {
          icon: <Shield className={cn(getIconSize(), "text-blue-500")} />,
          label: "Beginner",
          color: "text-blue-600 bg-blue-100",
        };
    }
  };

  const badgeDetails = getBadgeDetails();

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div
        className={cn(
          "rounded-full p-1",
          size === "sm" ? "p-0.5" : size === "lg" ? "p-1.5" : "p-1",
          badgeDetails.color
        )}
      >
        {badgeDetails.icon}
      </div>
      {showLabel && (
        <span
          className={cn(
            "font-medium",
            size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm"
          )}
        >
          {badgeDetails.label}
        </span>
      )}
    </div>
  );
};

export default BadgeIcon;
