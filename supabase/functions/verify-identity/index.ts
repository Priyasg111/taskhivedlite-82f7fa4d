
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const VERIFF_API_KEY = Deno.env.get("PASSBASE_API_KEY"); // Reusing the existing secret key slot

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
