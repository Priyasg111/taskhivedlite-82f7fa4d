import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const SecurityAlert = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [criticalEvents, setCriticalEvents] = useState(0);

  useEffect(() => {
    // Check for critical security events in localStorage fallback
    const criticalEventsData = localStorage.getItem('critical_security_events');
    if (criticalEventsData) {
      const events = JSON.parse(criticalEventsData);
      setCriticalEvents(events.length);
      setShowAlert(events.length > 0);
    }

    // Check if security database is not set up (fallback mode active)
    const securityBackup = localStorage.getItem('security_events_backup');
    if (securityBackup) {
      const events = JSON.parse(securityBackup);
      const hasClientFallback = events.some((event: any) => event.source === 'client_fallback');
      if (hasClientFallback) {
        setShowAlert(true);
      }
    }
  }, []);

  const clearCriticalEvents = () => {
    localStorage.removeItem('critical_security_events');
    setCriticalEvents(0);
    setShowAlert(false);
  };

  if (!showAlert) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          {criticalEvents > 0 ? (
            <>
              <strong>{criticalEvents} critical security event(s) detected!</strong>
              <br />
              Security database not deployed - events stored locally only.
            </>
          ) : (
            <>
              <strong>Security Warning:</strong> Database not deployed - using client fallback.
              <br />
              Deploy security-policies.sql immediately for full protection.
            </>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('/SECURITY_DEPLOYMENT.md', '_blank')}
          >
            <Shield className="h-3 w-3 mr-1" />
            Fix Guide
          </Button>
          {criticalEvents > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearCriticalEvents}
            >
              Clear
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default SecurityAlert;