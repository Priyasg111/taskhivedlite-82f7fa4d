import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth";
import { validateTransaction, checkRateLimit, logSecurityEvent } from "@/utils/securityUtils";

interface SecurePaymentFormProps {
  onPaymentSubmit: (amount: number, description: string) => Promise<void>;
  type: 'deposit' | 'withdrawal' | 'payment';
}

const SecurePaymentForm = ({ onPaymentSubmit, type }: SecurePaymentFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to continue",
        variant: "destructive"
      });
      return;
    }

    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Rate limiting check
      const canProceed = await checkRateLimit(user.id, 'transaction', 20, 60);
      if (!canProceed) {
        await logSecurityEvent(user.id, 'transaction_rate_limit', 'medium', 'Transaction rate limit exceeded');
        toast({
          title: "Too many requests",
          description: "Please wait before making another transaction",
          variant: "destructive"
        });
        return;
      }

      // Transaction validation
      const validation = await validateTransaction(user.id, numAmount, type);
      if (!validation.valid) {
        await logSecurityEvent(user.id, 'invalid_transaction', 'medium', `Transaction validation failed: ${validation.reason}`);
        toast({
          title: "Transaction not allowed",
          description: validation.reason || "Transaction validation failed",
          variant: "destructive"
        });
        return;
      }

      // Log transaction attempt
      await logSecurityEvent(user.id, 'transaction_attempt', 'low', `${type} transaction attempted for ${numAmount}`);

      await onPaymentSubmit(numAmount, description);
      
      // Log successful transaction
      await logSecurityEvent(user.id, 'transaction_success', 'low', `${type} transaction completed for ${numAmount}`);
      
      toast({
        title: "Transaction successful",
        description: `${type} of $${numAmount} has been processed`,
      });

      setAmount("");
      setDescription("");
    } catch (error) {
      await logSecurityEvent(user.id, 'transaction_error', 'high', `Transaction failed: ${error}`);
      toast({
        title: "Transaction failed",
        description: "Please try again or contact support",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Secure {type.charAt(0).toUpperCase() + type.slice(1)}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium mb-2">
              Amount ($)
            </label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              max="10000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              disabled={isProcessing}
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description
            </label>
            <Input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 200))}
              placeholder="Transaction description"
              disabled={isProcessing}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isProcessing || !amount}
          >
            {isProcessing ? "Processing..." : `Process ${type}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SecurePaymentForm;