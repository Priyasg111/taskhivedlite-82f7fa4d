import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { email } = await req.json()
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')

    // Call the database function to check account lockout
    const { data, error } = await supabaseClient
      .rpc('check_account_lockout', {
        p_email: email,
        p_ip_address: ipAddress
      })

    if (error) {
      console.error('Account lockout check error:', error)
      // Fail open - allow the request if there's an error
      return new Response(
        JSON.stringify({ 
          locked: false, 
          failed_attempts: 0,
          error: 'Lockout check failed' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify(data), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Account lockout function error:', error)
    // Fail open
    return new Response(
      JSON.stringify({ 
        locked: false, 
        failed_attempts: 0,
        error: 'Internal server error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})