
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { supabase } from "https://esm.sh/@supabase/supabase-js@2";

const VERIFF_API_KEY = Deno.env.get("PASSBASE_API_KEY"); // Reusing the existing secret key slot
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const adminSupabase = supabase.createClient(
  SUPABASE_URL!,
  SUPABASE_SERVICE_ROLE_KEY!
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerificationRequest {
  userId: string;
}

interface VerificationResponse {
  verification: {
    url: string;
    id: string;
  };
  status: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId }: VerificationRequest = await req.json();

    if (!userId) {
      throw new Error("User ID is required");
    }
    
    // Update user profile to pending_verification status immediately
    const { error: updateError } = await adminSupabase
      .from('user_profiles')
      .update({ kyc_status: "pending_verification" })
      .eq("id", userId);
      
    if (updateError) {
      console.error("Error updating user profile status:", updateError);
      throw updateError;
    }

    // Fetch user information to use in verification
    const { data: userData, error: userError } = await adminSupabase
      .from('user_profiles')
      .select('email')
      .eq('id', userId)
      .single();
      
    if (userError) {
      console.error("Error fetching user data:", userError);
      throw userError;
    }

    // Create a verification session with Veriff
    const response = await fetch("https://api.veriff.me/v1/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-AUTH-CLIENT": VERIFF_API_KEY,
      },
      body: JSON.stringify({
        verification: {
          callback: "https://taskhived.com/verification-complete",
          person: {
            firstName: "",
            lastName: ""
          },
          vendorData: userId,
          timestamp: new Date().toISOString()
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Veriff API error:", errorData);
      throw new Error(`Veriff API error: ${response.status} ${response.statusText}`);
    }

    const verificationData: VerificationResponse = await response.json();
    console.log("Verification session created:", verificationData);

    return new Response(JSON.stringify({
      success: true,
      verificationUrl: verificationData.verification.url,
      verificationId: verificationData.verification.id
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in verify-identity function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
