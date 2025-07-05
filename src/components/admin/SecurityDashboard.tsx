import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Shield, Activity, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SecurityEvent {
  id: string;
  user_id: string | null;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  ip_address: string | null;
  user_agent: string | null;
  metadata: any;
  created_at: string;
}

interface SecurityStats {
  totalEvents: number;
  criticalEvents: number;
  highEvents: number;
  recentEvents: number;
  uniqueUsers: number;
}

const SecurityDashboard = () => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [stats, setStats] = useState<SecurityStats>({
    totalEvents: 0,
    criticalEvents: 0,
    highEvents: 0,
    recentEvents: 0,
    uniqueUsers: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dbSetupRequired, setDbSetupRequired] = useState(false);

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    try {
      // Try to fetch security events - will fail if table doesn't exist
      const { data: events, error: eventsError } = await supabase
        .from('security_events' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (eventsError) {
        console.log('Security events table not found, setup required:', eventsError);
        setDbSetupRequired(true);
        setIsLoading(false);
        return;
      }

      const typedEvents = events ? (events as unknown as SecurityEvent[]) : [];
      setSecurityEvents(typedEvents || []);

      // Calculate stats
      if (typedEvents) {
        const now = new Date();
        const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        
        const recentEvents = typedEvents.filter(event => 
          new Date(event.created_at) > last24Hours
        ).length;

        const criticalEvents = typedEvents.filter(event => 
          event.severity === 'critical'
        ).length;

        const highEvents = typedEvents.filter(event => 
          event.severity === 'high'
        ).length;

        const uniqueUsers = new Set(
          typedEvents.filter(event => event.user_id).map(event => event.user_id)
        ).size;

        setStats({
          totalEvents: typedEvents.length,
          criticalEvents,
          highEvents,
          recentEvents,
          uniqueUsers
        });
      }
    } catch (error) {
      console.error('Error fetching security data:', error);
      setDbSetupRequired(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const formatEventType = (eventType: string) => {
    return eventType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (dbSetupRequired) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Security Dashboard</h2>
        </div>
        
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Security database tables are not set up yet. Please run the security-policies.sql script to enable security monitoring.
            <br />
            <br />
            <strong>Next Steps:</strong>
            <br />
            1. Execute the SQL file: supabase/functions/security-policies.sql
            <br />
            2. This will create the security_events, rate_limits, failed_login_attempts, and other security tables
            <br />
            3. Refresh this page to view security events
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardHeader>
            <CardTitle>Security Features Available</CardTitle>
            <CardDescription>These security features are currently active:</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Client-side input validation and sanitization</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Session monitoring and timeout</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Rate limiting (client-side with server-side backup)</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Suspicious activity detection</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span>Server-side security logging (requires database setup)</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span>Account lockout tracking (requires database setup)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Security Dashboard</h2>
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              All time security events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.criticalEvents}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentEvents}</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Affected Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueUsers}</div>
            <p className="text-xs text-muted-foreground">
              Unique users with events
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Events Alert */}
      {stats.criticalEvents > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {stats.criticalEvents} critical security event(s) detected. Immediate attention required.
          </AlertDescription>
        </Alert>
      )}

      {/* Security Events Table */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="critical">Critical</TabsTrigger>
          <TabsTrigger value="high">High</TabsTrigger>
          <TabsTrigger value="recent">Recent (24h)</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Security Events</CardTitle>
              <CardDescription>
                Complete log of security events across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Event Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {securityEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-mono text-xs">
                        {new Date(event.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>{formatEventType(event.event_type)}</TableCell>
                      <TableCell>
                        <Badge variant={getSeverityColor(event.severity) as any}>
                          {event.severity.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {event.description}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {event.user_id ? event.user_id.slice(0, 8) + '...' : 'Anonymous'}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {event.ip_address || 'Unknown'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="critical">
          <Card>
            <CardHeader>
              <CardTitle>Critical Security Events</CardTitle>
              <CardDescription>
                Events requiring immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Event Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {securityEvents.filter(event => event.severity === 'critical').map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-mono text-xs">
                        {new Date(event.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>{formatEventType(event.event_type)}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {event.description}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {event.user_id ? event.user_id.slice(0, 8) + '...' : 'Anonymous'}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {event.ip_address || 'Unknown'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="high">
          <Card>
            <CardHeader>
              <CardTitle>High Priority Security Events</CardTitle>
              <CardDescription>
                Events requiring prompt attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Event Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {securityEvents.filter(event => event.severity === 'high').map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-mono text-xs">
                        {new Date(event.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>{formatEventType(event.event_type)}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {event.description}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {event.user_id ? event.user_id.slice(0, 8) + '...' : 'Anonymous'}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {event.ip_address || 'Unknown'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events (24h)</CardTitle>
              <CardDescription>
                Security events from the last 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Event Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {securityEvents.filter(event => {
                    const eventDate = new Date(event.created_at);
                    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
                    return eventDate > yesterday;
                  }).map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-mono text-xs">
                        {new Date(event.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>{formatEventType(event.event_type)}</TableCell>
                      <TableCell>
                        <Badge variant={getSeverityColor(event.severity) as any}>
                          {event.severity.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {event.description}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {event.user_id ? event.user_id.slice(0, 8) + '...' : 'Anonymous'}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {event.ip_address || 'Unknown'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityDashboard;