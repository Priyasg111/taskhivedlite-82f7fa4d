
export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  credits?: number;
  type: string; // Changed from strict union type to string to match database return type
  status: string; // Changed from strict union type to string
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
