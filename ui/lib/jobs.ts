import { supabase } from "../lib/supabaseClient";
import { JobApplication, JobStatus } from "@/types/jobTypes";

export async function getJobs(): Promise<JobApplication[]> {
  const { data, error } = await supabase.from("job_applications").select("*");
  if (error) throw error;
  return data as JobApplication[];
}

export async function updateJobStatus(jobId: string, status:JobStatus): Promise<void> {
  const { error } = await supabase
    .from("job_applications")
    .update({ status })
    .eq("id", jobId);
  
  if (error) throw error;
}
