
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormInputProps {
  id: string;
  name: string;
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({
  id,
  name,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default FormInput;
