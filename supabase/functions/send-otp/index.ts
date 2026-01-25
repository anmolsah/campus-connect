import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SendOTPRequest {
  email: string;
  collegeName: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { email, collegeName }: SendOTPRequest = await req.json();

    if (!email || !collegeName) {
      return new Response(
        JSON.stringify({ error: "Email and college name are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const brevoApiKey = Deno.env.get("BREVO_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    await supabase
      .from("otp_codes")
      .delete()
      .eq("email", email);

    const { error: insertError } = await supabase
      .from("otp_codes")
      .insert({
        email,
        code: otp,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      throw new Error(`Failed to store OTP: ${insertError.message}`);
    }

    if (brevoApiKey) {
      const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": brevoApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: {
            name: "Campus Connect",
            email: "noreply@campusconnect.edu",
          },
          to: [{ email }],
          subject: "Your Campus Connect Verification Code",
          htmlContent: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
                .container { max-width: 480px; margin: 0 auto; padding: 40px 20px; }
                .logo { text-align: center; margin-bottom: 30px; }
                .code { font-size: 36px; font-weight: bold; letter-spacing: 8px; text-align: center; color: #0d9488; padding: 20px; background: #f0fdfa; border-radius: 12px; margin: 20px 0; }
                .message { color: #475569; line-height: 1.6; }
                .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px; text-align: center; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="logo">
                  <h1 style="color: #0d9488; margin: 0;">Campus Connect</h1>
                </div>
                <p class="message">Hi there,</p>
                <p class="message">Welcome to Campus Connect! Use the verification code below to complete your signup:</p>
                <div class="code">${otp}</div>
                <p class="message">This code expires in 10 minutes.</p>
                <p class="message">If you didn't request this code, you can safely ignore this email.</p>
                <div class="footer">
                  <p>Campus Connect - Connecting students at ${collegeName}</p>
                </div>
              </div>
            </body>
            </html>
          `,
        }),
      });

      if (!brevoResponse.ok) {
        console.error("Brevo API error:", await brevoResponse.text());
      }
    } else {
      console.log(`OTP for ${email}: ${otp}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: "OTP sent successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
