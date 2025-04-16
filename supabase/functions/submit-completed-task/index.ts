
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY') ?? '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    if (!openaiApiKey) {
      throw new Error('Missing OpenAI API key');
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header missing' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }
    
    // Extract JWT token from Authorization header
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the user token
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Authentication error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized access' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }
    
    const { task_id, comment, file_data } = await req.json();
    
    if (!task_id) {
      return new Response(
        JSON.stringify({ error: 'Task ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Fetch the task details
    const { data: task, error: taskError } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('id', task_id)
      .single();
    
    if (taskError || !task) {
      console.error('Task fetch error:', taskError);
      return new Response(
        JSON.stringify({ error: 'Task not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }
    
    // Check if the authenticated user is the assigned worker
    if (task.worker_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'You are not assigned to this task' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }
    
    // Check if the task is already completed
    if (task.status === 'completed') {
      return new Response(
        JSON.stringify({ error: 'Task already submitted' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Process file upload if provided
    let filePath = null;
    if (file_data) {
      try {
        const { name, content, contentType } = file_data;
        const fileBuffer = Uint8Array.from(atob(content), c => c.charCodeAt(0));
        const fileName = `${task_id}-${Date.now()}-${name}`;
        filePath = `task-submissions/${fileName}`;
        
        const { error: uploadError } = await supabaseAdmin.storage
          .from('task-attachments')
          .upload(filePath, fileBuffer, {
            contentType,
            upsert: true
          });
        
        if (uploadError) {
          console.error('File upload error:', uploadError);
          filePath = null;
        }
      } catch (fileError) {
        console.error('File processing error:', fileError);
      }
    }
    
    // Calculate time taken (in minutes)
    const submittedAt = new Date();
    const createdAt = new Date(task.created_at);
    const timeTaken = Math.floor((submittedAt.getTime() - createdAt.getTime()) / (1000 * 60));
    
    // Submit the content to OpenAI for validation
    let aiValidationPassed = false;
    let aiValidationSummary = '';
    let scoreValue = 0;
    
    try {
      // Combine comment and task details for AI validation
      const validationContent = `
Task title: ${task.title}
Task description: ${task.description}
Worker's comment: ${comment || 'No comment provided'}
File attached: ${filePath ? 'Yes' : 'No'}
Time taken: ${timeTaken} minutes
`;
      
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an AI task validator that evaluates if a worker has likely completed a task satisfactorily. Rate the submission on a scale of 0-5 where 5 is excellent. Return a JSON with three fields: "score" (number 0-5), "passed" (boolean), and "summary" (string with brief feedback).'
            },
            {
              role: 'user',
              content: validationContent
            }
          ],
          response_format: { type: "json_object" }
        })
      });
      
      if (openaiResponse.ok) {
        const aiResult = await openaiResponse.json();
        const aiContent = JSON.parse(aiResult.choices[0].message.content);
        
        scoreValue = aiContent.score;
        aiValidationPassed = aiContent.passed;
        aiValidationSummary = aiContent.summary;
      } else {
        console.error('OpenAI API error:', await openaiResponse.text());
        aiValidationSummary = 'AI validation service unavailable, flagging for human review';
      }
    } catch (aiError) {
      console.error('AI validation error:', aiError);
      aiValidationSummary = 'Error during validation, flagging for human review';
    }
    
    // Update task status based on AI validation
    const newStatus = aiValidationPassed ? 'completed' : 'under_review';
    const requiresHumanReview = !aiValidationPassed;
    const completedAt = aiValidationPassed ? submittedAt.toISOString() : null;
    
    // Update the task in the database
    const { data: updatedTask, error: updateError } = await supabaseAdmin
      .from('tasks')
      .update({
        status: newStatus,
        submission_text: comment || null,
        file_path: filePath,
        submitted_at: submittedAt.toISOString(),
        completed_at: completedAt,
        requires_human_review: requiresHumanReview,
        ai_validation_summary: aiValidationSummary,
        score: scoreValue,
        time_taken: timeTaken
      })
      .eq('id', task_id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Task update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update task status' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Determine response message based on validation result
    let message = '';
    let status = '';
    
    if (aiValidationPassed) {
      status = 'completed';
      message = 'Task completed successfully!';
    } else {
      status = 'under_review';
      message = 'Submission under manual review.';
    }
    
    return new Response(
      JSON.stringify({
        status,
        task: updatedTask,
        message,
        score: scoreValue,
        summary: aiValidationSummary
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Server error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
