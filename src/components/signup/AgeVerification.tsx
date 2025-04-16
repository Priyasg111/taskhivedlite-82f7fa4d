
import FormInput from "@/components/form/FormInput";
import { validateAge } from "@/utils/authUtils";
import React from "react";

interface AgeVerificationProps {
  dateOfBirth: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
}

const AgeVerification: React.FC<AgeVerificationProps> = ({
  dateOfBirth,
  onChange,
  error,
  disabled = false
}) => {
  return (
    <FormInput
      id="dateOfBirth"
      name="dateOfBirth"
      label="Date of Birth"
      type="date"
      placeholder="Select your date of birth"
      value={dateOfBirth}
      onChange={onChange}
      disabled={disabled}
      error={error}
    />
  );
};

export default AgeVerification;
