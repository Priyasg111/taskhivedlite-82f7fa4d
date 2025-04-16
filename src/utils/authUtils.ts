import { CustomUser } from "@/types/auth";
import { User } from "@supabase/supabase-js";

export const formatUserWithMetadata = (supabaseUser: User): CustomUser => {
  const customUser = supabaseUser as CustomUser;
  customUser.name = customUser.user_metadata?.name || '';
  customUser.experience = customUser.user_metadata?.experience || 0;
  return customUser;
};

export const validateAge = (dateOfBirth: string): boolean => {
  if (!dateOfBirth) return false;
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age >= 18;
};
