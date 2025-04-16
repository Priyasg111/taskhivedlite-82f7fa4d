
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
  welcomeType?: 'initial' | 'verified';
}

const getVerifiedWorkerEmailTemplate = (name: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to TaskHived - You're Verified!</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .logo { text-align: center; margin-bottom: 30px; }
    .logo img { max-width: 200px; }
    .button { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
  </style>
</head>
<body>
  <div class="logo">
    <img src="https://taskhived.com/logo.png" alt="TaskHived Logo">
  </div>
  
  <h1>Welcome to TaskHived — You're Verified!</h1>
  
  <p>Hi ${name},</p>
  
  <p>Great news! Your identity has been verified successfully, and your TaskHived account is now fully activated.</p>
  
  <p>You now have complete access to:</p>
  <ul>
    <li>Browse and complete verified tasks</li>
    <li>Receive payments directly to your connected wallet</li>
    <li>Build your reputation and earn badges</li>
    <li>Access premium high-paying tasks</li>
  </ul>
  
  <a href="https://taskhived.com/dashboard" class="button">Access My Dashboard</a>
  
  <p>If you have any questions or need assistance, our support team is here to help.</p>
  
  <div class="footer">
    <p>Welcome aboard,<br>The TaskHived Team</p>
  </div>
</body>
</html>
`;

const getWorkerEmailTemplate = (name: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to TaskHived</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .logo { text-align: center; margin-bottom: 30px; }
    .logo img { max-width: 200px; }
    .button { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
  </style>
</head>
<body>
  <div class="logo">
    <img src="https://taskhived.com/logo.png" alt="TaskHived Logo">
  </div>
  
  <p>Hi ${name},</p>
  
  <p>Welcome to TaskHived — we're thrilled to have you on board!</p>
  
  <p>Before you can start earning, please complete the identity verification process. This helps us maintain a secure platform for everyone.</p>
  
  <a href="https://taskhived.com/verification" class="button">Complete Verification</a>
  
  <p>Once verified, you'll gain access to all features and can start earning through AI-verified microtasks.</p>
  
  <div class="footer">
    <p>See you inside,<br>The TaskHived Team</p>
  </div>
</body>
</html>
`;

const getClientEmailTemplate = (name: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to TaskHived</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .logo { text-align: center; margin-bottom: 30px; }
    .logo img { max-width: 200px; }
    .button { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
  </style>
</head>
<body>
  <div class="logo">
    <img src="https://taskhived.com/logo.png" alt="TaskHived Logo">
  </div>
  
  <p>Hi ${name},</p>
  
  <p>Welcome to TaskHived — your new partner for getting work done efficiently.</p>
  
  <p>Your account has been created. We will be reviewing your profile shortly and will follow up with a few quick requirements to verify your organization before you can begin posting tasks.</p>
  
  <p>In the meantime, feel free to explore the platform and get familiar with how it works.</p>
  
  <a href="https://taskhived.com/login" class="button">Visit Dashboard</a>
  
  <div class="footer">
    <p>We'll be in touch shortly,<br>The TaskHived Team</p>
  </div>
</body>
</html>
`;

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, role, welcomeType = "initial" }: WelcomeEmailRequest = await req.json();

    if (!name || !email || !role) {
      throw new Error("Name, email, and role are required");
    }

    let emailSubject = '';
    let emailHtml = '';

    if (role === 'worker') {
      if (welcomeType === "verified") {
        emailSubject = "Welcome to TaskHived — You're Verified!";
        emailHtml = getVerifiedWorkerEmailTemplate(name);
      } else {
        emailSubject = "Welcome to TaskHived — Let's Get Started!";
        emailHtml = getWorkerEmailTemplate(name);
      }
    } else {
      emailSubject = "Welcome to TaskHived — Your Journey Starts Here";
      emailHtml = getClientEmailTemplate(name);
    }

    const emailResponse = await resend.emails.send({
      from: "TaskHived <onboarding@taskhived.com>",
      to: [email],
      subject: emailSubject,
      html: emailHtml,
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
