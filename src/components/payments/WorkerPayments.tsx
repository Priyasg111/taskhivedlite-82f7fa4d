import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth";
import { supabase } from "@/integrations/supabase/client";
import { Wallet, DollarSign, ArrowUp, CheckCircle, History } from "lucide-react";
import { Transaction } from "@/types/transaction";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

const WorkerPayments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [pendingEarnings, setPendingEarnings] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [walletAddress, setWalletAddress] = useState("");
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [walletType, setWalletType] = useState("crypto");
  const [cryptoToken, setCryptoToken] = useState("USDC");
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  
  // Fetch worker payment details
  useEffect(() => {
    const fetchPaymentDetails = async () => {
      if (!user) return;
      
      try {
        // Fetch wallet info
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('wallet_address, preferred_token')
          .eq('id', user.id)
          .single();
          
        if (profileError) throw profileError;
        
        if (profileData?.wallet_address) {
          setWalletAddress(profileData.wallet_address);
        }
        
        if (profileData?.preferred_token) {
          setCryptoToken(profileData.preferred_token);
        }
        
        // Fetch completed tasks with paid status
        const { data: paidTasks, error: paidTasksError } = await supabase
          .from('tasks')
          .select('payment')
          .eq('worker_id', user.id)
          .eq('status', 'verified')
          .eq('payment_status', 'paid');
          
        if (paidTasksError) throw paidTasksError;
        
        // Calculate total earnings from paid tasks
        const totalPaid = paidTasks?.reduce((sum, task) => sum + (parseFloat(task.payment.toString()) || 0), 0) || 0;
        setTotalEarnings(totalPaid);
        setAvailableBalance(totalPaid); // In a real system, this would subtract withdrawals
        
        // Fetch pending earnings (verified but not paid)
        const { data: pendingTasks, error: pendingTasksError } = await supabase
          .from('tasks')
          .select('payment')
          .eq('worker_id', user.id)
          .eq('status', 'verified')
          .eq('payment_status', 'pending');
          
        if (pendingTasksError) throw pendingTasksError;
        
        const totalPending = pendingTasks?.reduce((sum, task) => sum + (parseFloat(task.payment.toString()) || 0), 0) || 0;
        setPendingEarnings(totalPending);
        
        // Fetch transaction history
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .select('*')
          .or(`user_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .order('created_at', { ascending: false });
          
        if (transactionsError) throw transactionsError;
        
        setTransactions(transactionsData || []);
        
        // For backward compatibility, keep task payment history too
        const { data: historyData, error: historyError } = await supabase
          .from('tasks')
          .select('*')
          .eq('worker_id', user.id)
          .eq('payment_status', 'paid')
          .order('updated_at', { ascending: false })
          .limit(10);
          
        if (historyError) throw historyError;
        
        setPaymentHistory(historyData || []);
        
      } catch (err) {
        console.error("Error fetching worker payment data:", err);
      }
    };
    
    fetchPaymentDetails();
  }, [user]);
  
  // Handle wallet connection
  const handleConnectWallet = async () => {
    // In a real app, this would connect to MetaMask or other wallet providers
    // For demo purposes, we'll just update the database with a mock address
    
    setIsProcessing(true);
    
    try {
      const mockAddress = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
      
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          wallet_address: mockAddress,
          wallet_status: 'verified',
          preferred_token: cryptoToken
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      setWalletAddress(mockAddress);
      
      toast({
        title: "Wallet Connected",
        description: "Your wallet has been successfully connected and verified.",
      });
      
    } catch (err) {
      console.error("Error connecting wallet:", err);
      toast({
        title: "Connection Failed",
        description: "There was a problem connecting your wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle withdrawal request
  const handleWithdraw = async () => {
    if (!withdrawalAmount || parseFloat(withdrawalAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to withdraw",
        variant: "destructive",
      });
      return;
    }
    
    if (parseFloat(withdrawalAmount) > availableBalance) {
      toast({
        title: "Insufficient balance",
        description: "Your withdrawal amount exceeds your available balance",
        variant: "destructive",
      });
      return;
    }
    
    if (!walletAddress) {
      toast({
        title: "No wallet connected",
        description: "Please connect a wallet before withdrawing funds",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const amount = parseFloat(withdrawalAmount);
      
      // Record the transaction in the database
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount: amount,
          type: 'withdrawal',
          status: 'completed',
          role: 'worker',
          description: `Withdrawal to ${walletType} wallet`,
          payment_method: walletType,
          metadata: { 
            token: cryptoToken,
            wallet_address: walletAddress
          }
        });
        
      if (transactionError) throw transactionError;
      
      // Refresh the transaction list
      const { data: updatedTransactions, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .or(`user_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
        
      if (fetchError) throw fetchError;
      
      setTransactions(updatedTransactions || []);
      setAvailableBalance(availableBalance - amount);
      
      toast({
        title: "Withdrawal Initiated",
        description: `${withdrawalAmount} ${cryptoToken} will be sent to your wallet shortly.`,
      });
      
      setWithdrawalAmount("");
      
    } catch (err) {
      console.error("Error processing withdrawal:", err);
      toast({
        title: "Withdrawal Failed",
        description: "There was a problem processing your withdrawal. Please try again.",
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
        return 'Deposit';
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
      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Earnings */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        {/* Pending Earnings */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pendingEarnings.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        {/* Available Balance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${availableBalance.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Withdrawal Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Withdraw Funds</CardTitle>
        </CardHeader>
        <CardContent>
          {!walletAddress ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-4 mb-2">
                <Select value={walletType} onValueChange={setWalletType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Wallet Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="crypto">Crypto Wallet</SelectItem>
                    <SelectItem value="bank">Bank Account</SelectItem>
                  </SelectContent>
                </Select>
                
                {walletType === "crypto" && (
                  <Select value={cryptoToken} onValueChange={setCryptoToken}>
                    <SelectTrigger className="w-28">
                      <SelectValue placeholder="Token" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USDC">USDC</SelectItem>
                      <SelectItem value="ETH">ETH</SelectItem>
                      <SelectItem value="USDT">USDT</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              
              <div className="text-center py-4">
                <Wallet className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium mb-2">Connect Your Wallet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect a wallet to withdraw your earnings directly to your {walletType === "crypto" ? "crypto wallet" : "bank account"}.
                </p>
                <Button onClick={handleConnectWallet} disabled={isProcessing}>
                  {isProcessing ? "Connecting..." : `Connect ${walletType === "crypto" ? "Wallet" : "Bank Account"}`}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">Connected Wallet</div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Verified
                  </Badge>
                </div>
                <code className="text-xs break-all block p-2 bg-background border rounded-md">
                  {walletAddress}
                </code>
                <div className="text-xs text-muted-foreground mt-2">
                  Payments will be sent as {cryptoToken} to this address
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount to Withdraw</label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={withdrawalAmount}
                      onChange={(e) => setWithdrawalAmount(e.target.value)}
                      min="0.01"
                      step="0.01"
                      className="pl-9"
                    />
                  </div>
                  <Button 
                    onClick={handleWithdraw}
                    disabled={isProcessing || !withdrawalAmount || parseFloat(withdrawalAmount) <= 0 || parseFloat(withdrawalAmount) > availableBalance}
                  >
                    {isProcessing ? "Processing..." : "Withdraw"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Minimum withdrawal: $1.00. Withdrawals typically process within 24 hours.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Payment History */}
      <Tabs defaultValue="payouts">
        <TabsList className="mb-4">
          <TabsTrigger value="payouts">Payout History</TabsTrigger>
          <TabsTrigger value="pending">Pending Earnings</TabsTrigger>
        </TabsList>
        
        {/* Payout History Tab */}
        <TabsContent value="payouts">
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
                          transaction.type === 'payment' && transaction.recipient_id === user?.id
                            ? 'text-green-600'
                            : transaction.type === 'withdrawal'
                              ? 'text-amber-600'
                              : 'text-blue-600'
                        }`}>
                          {transaction.type === 'payment' && transaction.recipient_id === user?.id ? '+' : '-'}
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
        
        {/* Pending Earnings Tab */}
        <TabsContent value="pending">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Pending Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingEarnings > 0 ? (
                <div className="space-y-4">
                  {/* We would normally map over pending payments here */}
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                    <div>
                      <div className="font-medium">Pending Payments</div>
                      <div className="text-xs text-muted-foreground">
                        Payments will be released when employers approve
                      </div>
                    </div>
                    <div className="font-medium text-amber-600">
                      ${pendingEarnings.toFixed(2)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ArrowUp className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No pending earnings</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkerPayments;
