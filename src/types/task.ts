
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
  submission_text?: string | null;
  comment?: string | null;
  file_path?: string | null;
  submitted_at?: string | null;
  completed_at?: string | null;
  requires_human_review?: boolean;
  ai_validation_summary?: string | null;
  score?: number | null;
  category?: string;
  difficulty?: string;
  deadline?: string;
  estimatedTime?: string;
}

export interface TaskSubmission {
  task_id: string;
  comment?: string;
  file?: File;
}

export interface TaskSubmissionResult {
  status: 'completed' | 'under_review' | 'rejected';
  task: Task;
  message: string;
}
