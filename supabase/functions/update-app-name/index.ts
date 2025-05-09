
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Update all instances of "TaskHive" to "TaskHived" in user profiles
    console.log("Starting app name update process");
    
    // Update any metadata that might contain the old app name
    const { data: metadataData, error: metadataError } = await supabaseClient.rpc(
      'update_app_name_in_metadata',
      { old_name: 'TaskHive', new_name: 'TaskHived' }
    );
    
    if (metadataError) {
      console.error('Error updating metadata:', metadataError);
      throw metadataError;
    }
    
    console.log('Updated metadata references:', metadataData);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Successfully updated all references from 'TaskHive' to 'TaskHived'" 
      }),
      {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
        status: 400
      }
    );
  }
});
