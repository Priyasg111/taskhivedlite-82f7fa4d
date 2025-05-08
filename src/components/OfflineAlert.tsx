
import React from "react";
import { useKeepAlive } from "@/hooks/useKeepAlive";

const OfflineAlert: React.FC = () => {
  const { isOnline } = useKeepAlive();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white py-1 px-4 text-center z-50">
      Connection lost. Attempting to reconnect...
    </div>
  );
};

export default OfflineAlert;
