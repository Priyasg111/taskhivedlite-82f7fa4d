
-- Function to update app name references in metadata
CREATE OR REPLACE FUNCTION public.update_app_name_in_metadata(old_name TEXT, new_name TEXT)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count INT := 0;
  user_record RECORD;
  updated_metadata JSONB;
BEGIN
  -- Update user metadata
  FOR user_record IN 
    SELECT id, raw_user_meta_data 
    FROM auth.users 
    WHERE raw_user_meta_data::TEXT ILIKE '%' || old_name || '%'
  LOOP
    -- Convert metadata to text, replace occurrences, and convert back to JSONB
    updated_metadata := (replace(user_record.raw_user_meta_data::TEXT, old_name, new_name))::JSONB;
    
    -- Update the user metadata
    UPDATE auth.users
    SET raw_user_meta_data = updated_metadata
    WHERE id = user_record.id;
    
    updated_count := updated_count + 1;
  END LOOP;
  
  -- Return the number of updated records
  RETURN updated_count;
END;
$$;
