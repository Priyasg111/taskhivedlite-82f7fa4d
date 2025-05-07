
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

// Extend the Supabase User type to include our custom metadata
export interface CustomUser extends SupabaseUser {
  name?: string;
  experience: number;
  user_metadata: {
    name?: string;
    experience?: number;
    role?: string;
    user_type?: string;
    verified?: boolean;
  };
}

export interface AuthContextType {
  user: CustomUser | null;
  session: Session | null;
  isLoading: boolean;
  isVerified: boolean | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role?: string, userType?: string) => Promise<CustomUser | null>;
  logout: () => void;
  updateExperience: (hours: number) => void;
}
