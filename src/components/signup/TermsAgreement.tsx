
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface TermsAgreementProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const TermsAgreement: React.FC<TermsAgreementProps> = ({
  checked,
  onCheckedChange
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox 
        id="terms" 
        checked={checked}
        onCheckedChange={(checked) => onCheckedChange(checked as boolean)}
      />
      <label
        htmlFor="terms"
        className="text-sm text-muted-foreground"
      >
        I confirm that I am at least 18 years old and agree to the{" "}
        <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
        {" "}and{" "}
        <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
      </label>
    </div>
  );
};

export default TermsAgreement;
