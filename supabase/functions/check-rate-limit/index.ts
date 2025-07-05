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

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)

    const { 
      action_type = 'general',
      max_requests = 100,
      window_minutes = 60
    } = await req.json()

    const userId = user?.id || null
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')

    // Call the database function to check rate limit
    const { data, error } = await supabaseClient
      .rpc('check_rate_limit', {
        p_user_id: userId,
        p_action_type: action_type,
        p_ip_address: ipAddress,
        p_max_requests: max_requests,
        p_window_minutes: window_minutes
      })

    if (error) {
      console.error('Rate limit check error:', error)
      // Fail open - allow the request if there's an error
      return new Response(
        JSON.stringify({ allowed: true, error: 'Rate limit check failed' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ allowed: data }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Rate limit function error:', error)
    // Fail open
    return new Response(
      JSON.stringify({ allowed: true, error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})