
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = "https://ezyngxcqvmuljfkmgjgs.supabase.co";
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { taskId } = await req.json();
    
    if (!taskId) {
      return new Response(JSON.stringify({ error: "Missing task ID" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Retrieve task details from Supabase
    const taskResponse = await fetch(`${supabaseUrl}/rest/v1/tasks?id=eq.${taskId}&select=*`, {
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
      },
    });
    
    if (!taskResponse.ok) {
      throw new Error(`Failed to fetch task: ${taskResponse.statusText}`);
    }
    
    const tasks = await taskResponse.json();
    if (!tasks || tasks.length === 0) {
      return new Response(JSON.stringify({ error: "Task not found" }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const task = tasks[0];
    
    // Build context for OpenAI review
    const submissionText = task.submission_text || "No submission text provided";
    
    // Call OpenAI for task evaluation
    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAIApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an AI tasked with evaluating work submissions. Evaluate the task based on relevance, effort, and completion. Return a JSON with a score (integer 1-5) and a constructive comment."
          },
          {
            role: "user",
            content: `Please evaluate this task submission:\n\nTask Title: ${task.title}\nTask Description: ${task.description}\nSubmission: ${submissionText}`
          }
        ],
        response_format: { type: "json_object" }
      })
    });
    
    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.statusText}`);
    }
    
    const openAIData = await openAIResponse.json();
    const evaluation = JSON.parse(openAIData.choices[0].message.content);
    
    // Extract score and comment from evaluation
    const score = evaluation.score;
    const comment = evaluation.comment;
    
    // Update task in Supabase
    const isVerified = score >= 3; // Verify task if score is at least 3
    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/tasks?id=eq.${taskId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        score: score,
        comment: comment,
        reviewed_by_ai: true,
        status: isVerified ? 'verified' : 'rejected'
      })
    });
    
    if (!updateResponse.ok) {
      throw new Error(`Failed to update task: ${updateResponse.statusText}`);
    }
    
    // Return evaluation results
    return new Response(JSON.stringify({
      success: true,
      score: score,
      comment: comment,
      verified: isVerified
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in task verification:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
