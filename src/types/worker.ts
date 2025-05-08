
export type TaskActivity = {
  id: string;
  message: string;
  created_at: string;
  task_name?: string;
  task_id?: string;
};

export type TaskItem = {
  id: string;
  title: string;
  deadline?: string;
  status: 'assigned' | 'submitted' | 'verified' | 'rejected';
};
