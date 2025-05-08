
export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  credits?: number;
  type: 'purchase' | 'payment' | 'withdrawal';
  status: 'pending' | 'completed' | 'failed';
  payment_processor?: string;
  payment_id?: string;
  created_at: string;
  updated_at?: string;
  metadata?: Record<string, any>;
}
