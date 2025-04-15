
import { CustomUser } from "@/types/auth";
import { User } from "@supabase/supabase-js";

export const formatUserWithMetadata = (supabaseUser: User): CustomUser => {
  const customUser = supabaseUser as CustomUser;
  customUser.name = customUser.user_metadata?.name || '';
  customUser.experience = customUser.user_metadata?.experience || 0;
  return customUser;
};
