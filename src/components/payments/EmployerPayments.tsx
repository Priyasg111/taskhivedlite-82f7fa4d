import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, CreditCard, History, Wallet, ArrowDown } from "lucide-react";
import { Transaction } from "@/types/transaction";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

const EmployerPayments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [credits, setCredits] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  
  // Fetch employer's credit balance and payment history
  useEffect(() => {
    const fetchCreditsAndHistory = async () => {
      if (!user) return;
      
      try {
        // Fetch credits
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('credits')
          .eq('id', user.id)
          .single();
          
        if (profileError) throw profileError;
        
        setCredits(profileData?.credits || 0);
        
        // Fetch transaction history
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (transactionsError) throw transactionsError;
        
        setTransactions(transactionsData as Transaction[] || []);
        
        // Fetch pending payments (tasks with 'verified' status but 'pending' payment)
        const { data: pendingTasksData, error: pendingTasksError } = await supabase
          .from('tasks')
          .select('*, worker:worker_id(email)')
          .eq('client_id', user.id)
          .eq('status', 'verified')
          .eq('payment_status', 'pending');
          
        if (pendingTasksError) throw pendingTasksError;
        
        setPendingPayments(pendingTasksData || []);
        
      } catch (err) {
        console.error("Error fetching employer payment data:", err);
      }
    };
    
    fetchCreditsAndHistory();
  }, [user]);
  
  // Handle initiating Stripe checkout for adding funds
  const handleAddFunds = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to deposit",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const amount = parseFloat(depositAmount);
      const credits = Math.floor(amount);
      
      // Call our Edge Function to create a Stripe checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { amount, credits }
      });
      
      if (error) throw error;
      
      // Redirect to Stripe checkout
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
      
    } catch (err) {
      console.error("Error creating checkout session:", err);
      toast({
        title: "Payment Error",
        description: "There was a problem processing your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle paying a worker for a completed task
  const handlePayWorker = async (taskId: string, workerId: string, payment: number) => {
    setIsProcessing(true);
    
    try {
      // Update the task payment status
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ payment_status: 'paid' })
        .eq('id', taskId);
        
      if (updateError) throw updateError;
      
      // Record the transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user?.id,
          recipient_id: workerId,
          amount: payment,
          type: 'payment',
          status: 'completed',
          role: 'employer',
          description: `Payment for task: ${taskId}`,
          payment_method: 'credits'
        });
        
      if (transactionError) throw transactionError;
      
      // Update user's credit balance
      const { error: creditError } = await supabase
        .from('user_profiles')
        .update({ credits: credits - payment })
        .eq('id', user?.id);
        
      if (creditError) throw creditError;
      
      // Refresh pending payments list and user credits
      const { data: updatedTasks, error: fetchError } = await supabase
        .from('tasks')
        .select('*, worker:worker_id(email)')
        .eq('client_id', user?.id)
        .eq('status', 'verified')
        .eq('payment_status', 'pending');
        
      if (fetchError) throw fetchError;
      
      setPendingPayments(updatedTasks || []);
      setCredits(credits - payment);
      
      // Refresh transaction list
      const { data: updatedTransactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
        
      if (transactionsError) throw transactionsError;
      
      setTransactions(updatedTransactions as Transaction[] || []);
      
      toast({
        title: "Payment Successful",
        description: "Worker has been paid for the completed task",
      });
      
    } catch (err) {
      console.error("Error processing worker payment:", err);
      toast({
        title: "Payment Error",
        description: "There was a problem processing the payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric", 
      month: "short", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Get transaction type display value
  const getTransactionTypeDisplay = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Added Credits';
      case 'payment':
        return 'Task Payment';
      case 'withdrawal':
        return 'Withdrawal';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Credit Balance Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Employer Account Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
            <div>
              <div className="text-3xl font-bold">{credits} Credits</div>
              <div className="text-sm text-muted-foreground">Available for task payments</div>
            </div>
          </div>
          
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Add Funds</label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="Amount"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  min="1"
                  step="1"
                  className="flex-1"
                />
                <Button 
                  onClick={handleAddFunds}
                  disabled={isProcessing || !depositAmount}
                  className="whitespace-nowrap"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Deposit
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                $1 USD = 1 Credit. Funds will be available immediately for task payments.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabbed Content */}
      <Tabs defaultValue="pending">
        <TabsList className="mb-4">
          <TabsTrigger value="pending">Pending Payments</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
        </TabsList>
        
        {/* Pending Payments Tab */}
        <TabsContent value="pending">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Payments for Completed Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingPayments.length > 0 ? (
                <div className="space-y-4">
                  {pendingPayments.map((task) => (
                    <div 
                      key={task.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="space-y-1">
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm text-muted-foreground">
                          Worker: {task.worker?.email || "Unknown"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Completed on {formatDate(task.updated_at)}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="font-semibold">${task.payment.toFixed(2)}</div>
                        <Button
                          size="sm"
                          onClick={() => handlePayWorker(task.id, task.worker_id, task.payment)}
                          disabled={isProcessing || credits < task.payment}
                        >
                          Pay Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ArrowDown className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No pending payments</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Transaction History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">
                          {getTransactionTypeDisplay(transaction.type)}
                        </TableCell>
                        <TableCell className={`font-medium ${
                          transaction.type === 'deposit' ? 'text-green-600' : 'text-blue-600'
                        }`}>
                          {transaction.type === 'deposit' ? '+' : '-'}
                          {transaction.amount.toFixed(2)} {transaction.currency || 'USD'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(transaction.created_at)}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : transaction.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <History className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No transaction history</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmployerPayments;
