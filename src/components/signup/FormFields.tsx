
import React from "react";
import FormInput from "@/components/form/FormInput";
import RoleSelector from "@/components/form/RoleSelector";
import AgeVerification from "@/components/signup/AgeVerification";
import TermsAgreement from "@/components/signup/TermsAgreement";
import { SignupFormData } from "@/components/form/ValidationSchema";

interface FormFieldsProps {
  formData: SignupFormData & { role: string };
  errors: Record<string, string>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRoleChange: (role: string) => void;
  setAgreeToTerms: (checked: boolean) => void;
  agreeToTerms: boolean;
  isLoading: boolean;
}

const FormFields: React.FC<FormFieldsProps> = ({
  formData,
  errors,
  handleChange,
  handleRoleChange,
  setAgreeToTerms,
  agreeToTerms,
  isLoading
}) => {
  return (
    <div className="space-y-4">
      <FormInput
        id="name"
        name="name"
        label="Full Name"
        placeholder="John Doe"
        value={formData.name}
        onChange={handleChange}
        disabled={isLoading}
        error={errors.name}
      />
      
      <FormInput
        id="email"
        name="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={formData.email}
        onChange={handleChange}
        disabled={isLoading}
        error={errors.email}
      />
      
      <AgeVerification
        dateOfBirth={formData.dateOfBirth}
        onChange={handleChange}
        error={errors.dateOfBirth}
        disabled={isLoading}
      />
      
      <FormInput
        id="password"
        name="password"
        label="Password"
        type="password"
        placeholder="••••••••"
        value={formData.password}
        onChange={handleChange}
        disabled={isLoading}
        error={errors.password}
      />
      
      <FormInput
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm Password"
        type="password"
        placeholder="••••••••"
        value={formData.confirmPassword}
        onChange={handleChange}
        disabled={isLoading}
        error={errors.confirmPassword}
      />
      
      <RoleSelector 
        selectedRole={formData.role}
        onChange={handleRoleChange}
        disabled={isLoading}
      />

      <TermsAgreement
        checked={agreeToTerms}
        onCheckedChange={setAgreeToTerms}
      />
    </div>
  );
};

export default FormFields;
