
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "@/components/NavBar";
import SignUpForm from "@/components/SignUpForm";
import { useAuth } from "@/context/auth";
import Footer from "@/components/Footer";

const Signup = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user && !isLoading) {
      navigate("/");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1 container py-12 px-4 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 container py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <SignUpForm />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Signup;
