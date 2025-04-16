
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  name: string;
  email: string;
  role: 'worker' | 'client';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, role }: WelcomeEmailRequest = await req.json();

    let emailSubject = '';
    let emailBody = '';

    if (role === 'worker') {
      emailSubject = "Welcome to HiveTasked – Confirm your account";
      emailBody = `
        Hi ${name},

        Thank you for signing up to HiveTasked. Please confirm your email to activate your account and begin tasking.

        Best regards,
        The HiveTasked Team
      `;
    } else {
      emailSubject = "Thank you for joining HiveTasked";
      emailBody = `
        Hi ${name},

        We've received your signup. A member of our partnerships team will be in touch shortly to help you start posting tasks.

        Best regards,
        The HiveTasked Team
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "HiveTasked <onboarding@hivetasked.com>",
      to: [email],
      subject: emailSubject,
      text: emailBody,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
