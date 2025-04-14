
// Define interfaces to match our database tables
export interface UserProfile {
  id: string;
  role: 'admin' | 'client' | 'worker';
  credits: number;
  wallet_address: string | null;
  wallet_status: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  client_id: string;
  worker_id: string | null;
  title: string;
  description: string;
  payment: number;
  time_taken: number | null;
  status: string;
  payment_status: string | null;
  created_at: string;
  updated_at: string;
  client_name?: string;
  client_email?: string;
  worker_name?: string;
  worker_email?: string;
  worker_wallet_address?: string | null;
  worker_wallet_status?: string | null;
}
