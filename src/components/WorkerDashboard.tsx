
import { Loader } from "lucide-react";
import WorkerDataProvider from "./worker/WorkerDataProvider";
import WalletConnect from "./worker/WalletConnect";
import PayoutsList from "./worker/PayoutsList";
import RecentPayouts from "./worker/RecentPayouts";

const WorkerDashboard = () => {
  return (
    <WorkerDataProvider>
      {({ 
        walletAddress, 
        walletStatus, 
        pendingPayouts, 
        setWalletAddress, 
        setWalletStatus,
        isLoading
      }) => (
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <WalletConnect
                walletAddress={walletAddress}
                walletStatus={walletStatus}
                setWalletAddress={setWalletAddress}
                setWalletStatus={setWalletStatus}
              />
              <PayoutsList pendingPayouts={pendingPayouts} />
              <RecentPayouts />
            </>
          )}
        </div>
      )}
    </WorkerDataProvider>
  );
};

export default WorkerDashboard;
