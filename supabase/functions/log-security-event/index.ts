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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)

    const { 
      user_id, 
      event_type, 
      severity, 
      description, 
      ip_address, 
      user_agent, 
      metadata 
    } = await req.json()

    // Use current user if no user_id provided
    const finalUserId = user_id || user?.id || null

    // Get client IP from headers
    const clientIP = ip_address || req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
    const clientUserAgent = user_agent || req.headers.get('user-agent')

    // Insert security event
    const { error } = await supabaseClient
      .from('security_events')
      .insert({
        user_id: finalUserId,
        event_type,
        severity,
        description,
        ip_address: clientIP,
        user_agent: clientUserAgent,
        metadata
      })

    if (error) {
      console.error('Error logging security event:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to log security event' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ success: true }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Security event logging error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})