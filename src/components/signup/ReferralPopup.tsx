
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ReferralPopupProps {
  role: string;
}

const ReferralPopup: React.FC<ReferralPopupProps> = ({ role }) => {
  const [referralCode, setReferralCode] = useState("");

  // Only show for workers
  if (role !== "worker") {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Have a referral code?
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Referral Program</h4>
            <p className="text-sm text-muted-foreground">
              Enter a referral code to get started with bonus credits!
            </p>
          </div>
          <div className="grid gap-2">
            <Input
              id="referralCode"
              placeholder="Enter referral code"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
            />
            <Button 
              className="w-full"
              onClick={() => {
                // Handle referral code submission here
                console.log("Referral code submitted:", referralCode);
              }}
            >
              Apply Code
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ReferralPopup;
