
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import FormError from "@/components/form/FormError";
import FormFields from "@/components/signup/FormFields";
import { useSignUpForm } from "@/hooks/useSignUpForm";

const SignUpForm = () => {
  const navigate = useNavigate();
  const { 
    formState, 
    setAgreeToTerms, 
    handleChange,
    handleDateChange, 
    handleRoleChange,
    handleUserTypeChange,
    handleSubmit 
  } = useSignUpForm();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl">Create Account</CardTitle>
        <CardDescription className="text-center">
          Sign up to start earning on AI-verified tasks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormError error={formState.generalError} />
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormFields
            formData={formState.formData}
            errors={formState.errors}
            handleChange={handleChange}
            handleDateChange={handleDateChange}
            handleRoleChange={handleRoleChange}
            handleUserTypeChange={handleUserTypeChange}
            setAgreeToTerms={setAgreeToTerms}
            agreeToTerms={formState.agreeToTerms}
            isLoading={formState.isLoading}
          />
          
          <Button type="submit" className="w-full" disabled={formState.isLoading}>
            {formState.isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Button 
            variant="link" 
            className="p-0" 
            onClick={() => navigate("/login")}
            disabled={formState.isLoading}
          >
            Log in
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
};

export default SignUpForm;
