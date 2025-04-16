
import React, { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface AgeVerificationProps {
  dateOfBirth: string;
  onChange: (date: string) => void;
  error?: string;
  disabled?: boolean;
}

const AgeVerification: React.FC<AgeVerificationProps> = ({
  dateOfBirth,
  onChange,
  error,
  disabled = false
}) => {
  // Calculate the date range for 18-90 years old
  const today = new Date();
  const minDate = new Date(today);
  minDate.setFullYear(today.getFullYear() - 90); // 90 years ago
  
  const maxDate = new Date(today);
  maxDate.setFullYear(today.getFullYear() - 18); // 18 years ago
  
  // Default to year 2000 if no date is selected
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // When calendar opens for the first time and no date, default to year 2000
  const defaultDate = new Date(2000, 0, 1);
  
  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange(format(date, "yyyy-MM-dd"));
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="dateOfBirth">Date of Birth</Label>
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="dateOfBirth"
            className={cn(
              "w-full justify-start text-left font-normal",
              !dateOfBirth && "text-muted-foreground",
              error && "border-red-500"
            )}
            disabled={disabled}
            onClick={() => setIsCalendarOpen(true)}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateOfBirth ? (
              format(new Date(dateOfBirth), "PPP")
            ) : (
              <span>Select your date of birth</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateOfBirth ? new Date(dateOfBirth) : undefined}
            onSelect={handleSelect}
            defaultMonth={dateOfBirth ? new Date(dateOfBirth) : defaultDate}
            fromDate={minDate}
            toDate={maxDate}
            captionLayout="dropdown-buttons"
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default AgeVerification;
