
import NavBar from "@/components/NavBar";
import VerificationCallback from "@/components/verification/VerificationCallback";

const VerificationComplete = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 container py-12 px-4 flex items-center justify-center">
        <VerificationCallback />
      </main>
    </div>
  );
};

export default VerificationComplete;
