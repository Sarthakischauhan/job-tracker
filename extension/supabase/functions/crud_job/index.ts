// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getJobDetails} from "./inference.ts";
import { JobDataProps, InferenceReturnProps } from "./types.ts";

const corsHeaders: Record<string, string> = {
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
    const { description, url, createdAt} = await req.json();
    
    // Initialize Supabase client
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    const openaiApiKey = Deno.env.get('OPEN_AI_KEY');

    if (!openaiApiKey){
      throw new Error("Cannot proceed without an Open AI API key");
    }
    
    // Let's do some checks 
    if (!description && description.length < 50) {
      throw new Error("Job description is needed for tracking")
    }
    let jobData: JobDataProps = {
      description: description, 
      applied_at: createdAt,
      job_url: url,
    };
    const aiAnalysis: InferenceReturnProps | null = await getJobDetails(openaiApiKey, description);

    if (aiAnalysis){
      jobData = {
        ...jobData, 
        // job summary by AI 
        job_title: aiAnalysis?.jobTitle,
        company: aiAnalysis?.company,
        required_skills: aiAnalysis?.skillsRequired,
        preferred_skills: aiAnalysis?.skillsPreferred,
        experience_level: aiAnalysis?.experienceRequired,
        salary_range: aiAnalysis?.salaryRange,
        remote_option: aiAnalysis?.remote,
        ai_summary: aiAnalysis?.jobDesc
      };
    } 
   
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
