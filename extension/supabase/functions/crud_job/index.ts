// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import getJobDetails from "./inference.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

Deno.serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }

  try {
    const { jobTitle, company, description, url } = await req.json();
    
    // Fixed validation logic (was using bitwise OR instead of logical OR)
    if (!jobTitle || !company) {
      throw new Error("Job Title and Company name are required");
    }

    // Initialize Supabase client
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    const openaiApiKey = Deno.env.get('OPEN_AI_KEY');

    // Process with OpenAI if description exists and API key is available
    let aiAnalysis = null;
   
    if (description && description.length > 50 && openaiApiKey) {
      console.log('Processing job description with AI...');
      aiAnalysis = await getJobDetails(openaiApiKey, description);
    } else {
      console.log('Skipping AI analysis - missing description or API key');
    }
   
    // Prepare job data for database
    const jobData = {
      job_title: jobTitle,
      company: company,
      description: description || null,
      job_url: url || null,
      applied_at: new Date().toISOString(),
      // job summary by AI 
      required_skills: aiAnalysis?.skillsRequired || [],
      preferred_skills: aiAnalysis?.skillsPreferred || [],
      experience_level: aiAnalysis?.experienceRequired || null,
      salary_range: aiAnalysis?.salaryRange || null,
      remote_option: aiAnalysis?.remote ? 'remote' : 'onsite',
      ai_summary: aiAnalysis?.jobDesc || null
    };
   
    // Save to Supabase
    const { data, error } = await supabase.from('job_applications').insert([
      jobData
    ]).select().single();
    
    if (error) {
      console.error('Supabase error:', error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    console.log('Job saved successfully:', data.id);
    
    // Return success response
    return new Response(JSON.stringify({
      success: true,
      data: data,
      message: aiAnalysis ? 'Job saved and analyzed successfully' : 'Job saved successfully (no AI analysis)',
      aiAnalysisPerformed: !!aiAnalysis
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error : any) {
    
    console.error('Error processing job:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: error.stack
    }),
    // Response for bad request
    {
      status: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
