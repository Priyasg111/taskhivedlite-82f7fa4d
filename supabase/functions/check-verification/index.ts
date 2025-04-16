
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

interface CheckVerificationRequest {
  verificationId: string;
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { verificationId, userId }: CheckVerificationRequest = await req.json();

    if (!verificationId || !userId) {
      throw new Error("Verification ID and User ID are required");
    }

    // Check verification status with Veriff
    const response = await fetch(`https://api.veriff.me/v1/sessions/${verificationId}/decision`, {
      method: "GET",
      headers: {
        "X-AUTH-CLIENT": VERIFF_API_KEY,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Veriff API error:", errorData);
      throw new Error(`Veriff API error: ${response.status} ${response.statusText}`);
    }

    const verificationData = await response.json();
    console.log("Verification status:", verificationData);

    // If verification is approved, update the user's KYC status
    if (verificationData.verification.status === "approved") {
      const { error } = await adminSupabase
        .from('user_profiles')
        .update({
          kyc_status: "verified"
        })
        .eq("id", userId);

      if (error) {
        console.error("Error updating user profile:", error);
        throw error;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      status: verificationData.verification.status,
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in check-verification function:", error);
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
