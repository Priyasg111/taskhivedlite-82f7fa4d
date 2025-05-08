
export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  credits?: number;
  type: 'deposit' | 'payment' | 'withdrawal';
  status: 'pending' | 'completed' | 'failed';
  payment_processor?: string;
  payment_id?: string;
  created_at: string;
  updated_at?: string;
  metadata?: Record<string, any>;
  role?: string;
  currency?: string;
  recipient_id?: string;
  description?: string;
  payment_method?: string;
}
