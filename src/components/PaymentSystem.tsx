
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DollarSign, ArrowDown, ArrowUp, CheckCircle, Wallet, AlertTriangle, CreditCard, Bitcoin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Label } from "@/components/ui/label";

// Sample payment history data
const samplePayments = [
  {
    id: "tx-1",
    type: "incoming",
    amount: 15.00,
    date: "2025-04-06T14:32:00Z",
    status: "completed",
    task: "Data Labeling for AI Training",
    from: "CompanyX",
    method: "USD",
  },
  {
    id: "tx-2",
    type: "incoming",
    amount: 22.75,
    date: "2025-04-04T09:15:00Z",
    status: "completed",
    task: "Audio Transcription",
    from: "AudioCorp",
    method: "USDC",
  },
  {
    id: "tx-3",
    type: "outgoing",
    amount: 50.00,
    date: "2025-04-02T16:45:00Z",
    status: "completed",
    task: "Content Moderation",
    from: "TaskHived Wallet",
    method: "ETH",
  },
  {
    id: "tx-4",
    type: "incoming",
    amount: 8.50,
    date: "2025-03-28T11:20:00Z",
    status: "pending",
    task: "E-commerce Data Entry",
    from: "ShopGlobal",
    method: "USD",
  },
];

const PaymentSystem = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(96.25);
  const [walletAddress, setWalletAddress] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawCurrency, setWithdrawCurrency] = useState("USDC");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("crypto");
  const { toast } = useToast();
  
  const handleConnectWallet = () => {
    // In a real app, this would connect to MetaMask or other crypto wallets
    setWalletAddress("0x71C7656EC7ab88b098defB751B7401B5f6d8976F");
    toast({
      title: "Wallet connected",
      description: "Your crypto wallet has been successfully connected.",
    });
  };
  
  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to withdraw.",
        variant: "destructive",
      });
      return;
    }
    
    if (amount > balance) {
      toast({
        title: "Insufficient balance",
        description: "Your withdrawal amount exceeds your available balance.",
        variant: "destructive",
      });
      return;
    }
    
    setIsWithdrawing(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setBalance(prev => prev - amount);
      setWithdrawAmount("");
      
      toast({
        title: "Withdrawal successful",
        description: `${amount.toFixed(2)} ${withdrawCurrency} has been sent to your ${paymentMethod === "fiat" ? "bank account" : "wallet"}.`,
      });
    } catch (error) {
      toast({
        title: "Withdrawal failed",
        description: "There was a problem processing your withdrawal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsWithdrawing(false);
    }
  };
  
  const handlePaymentGateway = () => {
    window.open("https://stripe.com/payments", "_blank");
    toast({
      title: "Redirecting to payment gateway",
      description: "You're being redirected to our secure payment processor.",
    });
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Wallet className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Access your payments</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Sign in to view your earnings, connect your crypto wallet, and withdraw funds.
        </p>
        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <a href="/login">Log In</a>
          </Button>
          <Button asChild>
            <a href="/signup">Sign Up</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle>Your Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-brand-blue/10 flex items-center justify-center">
                <DollarSign className="h-8 w-8 text-brand-blue" />
              </div>
              <div>
                <div className="text-3xl font-bold">{balance.toFixed(2)} USDC</div>
                <div className="text-sm text-muted-foreground">Available for withdrawal</div>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="mt-4 flex items-center" 
              onClick={handlePaymentGateway}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Add Funds via Payment Gateway
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Withdraw Funds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Choose Withdrawal Method</h3>
                <RadioGroup 
                  defaultValue="crypto" 
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="grid grid-cols-2 gap-4"
                >
                  <div>
                    <RadioGroupItem value="fiat" id="fiat" className="peer sr-only" />
                    <Label
                      htmlFor="fiat"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <DollarSign className="mb-3 h-6 w-6" />
                      Money (USD)
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="crypto" id="crypto" className="peer sr-only" />
                    <Label
                      htmlFor="crypto"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <Bitcoin className="mb-3 h-6 w-6" />
                      Crypto
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {paymentMethod === "crypto" ? (
                <div className="space-y-4">
                  {!walletAddress ? (
                    <div className="text-center space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Connect your cryptocurrency wallet to receive payments.
                      </p>
                      <Button onClick={handleConnectWallet}>Connect Wallet</Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Connected Wallet</label>
                        <div className="flex items-center">
                          <code className="text-xs break-all bg-muted p-2 rounded w-full">
                            {walletAddress}
                          </code>
                        </div>
                        <div className="flex items-center">
                          <Badge variant="outline" className="text-xs mt-1">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Select Crypto</label>
                        <select 
                          className="border rounded-md p-2 text-sm bg-background w-full"
                          value={withdrawCurrency}
                          onChange={(e) => setWithdrawCurrency(e.target.value)}
                        >
                          <option value="USDC">USDC</option>
                          <option value="ETH">ETH</option>
                          <option value="BTC">BTC</option>
                          <option value="USDT">USDT</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bank Account Info</label>
                    <Input
                      type="text"
                      placeholder="Account Number"
                      className="mb-2"
                    />
                    <Input
                      type="text"
                      placeholder="Routing Number"
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount to Withdraw</label>
                <Input
                  type="number"
                  placeholder="Amount"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
              <Button 
                onClick={handleWithdraw}
                disabled={isWithdrawing || !withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > balance || (paymentMethod === "crypto" && !walletAddress)}
                className="w-full"
              >
                {isWithdrawing ? "Processing..." : "Withdraw"}
              </Button>
              
              <div className="mt-2 text-xs text-muted-foreground flex items-start gap-1">
                <AlertTriangle className="h-3 w-3 mt-0.5" />
                <span>
                  {paymentMethod === "crypto" 
                    ? `Make sure the withdrawal address supports ${withdrawCurrency} on the correct network.` 
                    : "Bank transfers typically take 1-3 business days to process."}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="history">
        <TabsList className="mb-4">
          <TabsTrigger value="history">Transaction History</TabsTrigger>
          <TabsTrigger value="pending">Pending Earnings</TabsTrigger>
        </TabsList>
        <TabsContent value="history">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {samplePayments.map((payment) => (
                  <div 
                    key={payment.id}
                    className="flex items-center justify-between p-3 rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        payment.type === "incoming" 
                          ? "bg-green-100 text-green-600" 
                          : "bg-blue-100 text-blue-600"
                      }`}>
                        {payment.type === "incoming" 
                          ? <ArrowDown className="h-5 w-5" /> 
                          : <ArrowUp className="h-5 w-5" />}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{payment.task}</div>
                        <div className="text-xs text-muted-foreground">
                          {payment.type === "incoming" ? `From: ${payment.from}` : `To: ${payment.from}`} | {formatDate(payment.date)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${
                        payment.type === "incoming" ? "text-green-600" : "text-blue-600"
                      }`}>
                        {payment.type === "incoming" ? "+" : "-"}
                        {payment.amount.toFixed(2)} {payment.method}
                      </div>
                      <Badge variant={payment.status === "completed" ? "outline" : "secondary"} className="text-xs">
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pending">
          <Card>
            <CardContent className="pt-6 pb-4">
              <div className="text-center py-8">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                  <DollarSign className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No pending earnings</h3>
                <p className="text-sm text-muted-foreground mt-2 mb-4">
                  When you complete tasks, your pending earnings will appear here until they're verified.
                </p>
                <Button variant="outline" asChild>
                  <a href="/complete-tasks">Find Tasks to Complete</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentSystem;
