
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TaskList from "./admin/TaskList";
import AdminDataProvider from "./admin/AdminDataProvider";
import SecurityDashboard from "./admin/SecurityDashboard";

const AdminPanel = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="tasks" className="space-y-6">
        <TabsList>
          <TabsTrigger value="tasks">Task Management</TabsTrigger>
          <TabsTrigger value="security">Security Dashboard</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks">
          <Card>
        <CardHeader>
          <CardTitle>Admin Task Management</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminDataProvider>
            {({ tasks, loading, processingTask, approveTask, rejectTask }) => (
              <Tabs defaultValue="pending">
                <TabsList>
                  <TabsTrigger value="pending">Pending Review</TabsTrigger>
                  <TabsTrigger value="verified">Verified</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>
                
                <TabsContent value="pending" className="mt-4">
                  <TaskList 
                    tasks={tasks}
                    status="pending"
                    loading={loading}
                    processingTask={processingTask}
                    onApprove={approveTask}
                    onReject={rejectTask}
                  />
                </TabsContent>
                
                <TabsContent value="verified" className="mt-4">
                  <TaskList 
                    tasks={tasks}
                    status="verified"
                    loading={loading}
                    processingTask={processingTask}
                    onApprove={approveTask}
                    onReject={rejectTask}
                  />
                </TabsContent>
                
                <TabsContent value="rejected" className="mt-4">
                  <TaskList 
                    tasks={tasks}
                    status="rejected"
                    loading={loading}
                    processingTask={processingTask}
                    onApprove={approveTask}
                    onReject={rejectTask}
                  />
                </TabsContent>
              </Tabs>
            )}
          </AdminDataProvider>
        </CardContent>
      </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <SecurityDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
