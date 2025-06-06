import { supabase } from "../lib/supabaseClient";

export type JobApplication = {
  id: string;
  job_title: string;
  company: string;
  description: string | null;
  job_url: string | null;
  applied_at: string;
  required_skills: string[];
  preferred_skills: string[];
  experience_level: string | null;
  salary_range: string | null;
  remote_option: "remote" | "onsite";
  ai_summary: string | null;
  status: "applied" | "interviewing" | "offer" | "rejected" | "withdrawn";
  priority: "low" | "medium" | "high";
};

export async function getJobs(): Promise<JobApplication[]> {
  const { data, error } = await supabase.from("job_applications").select("*");
  if (error) throw error;
  return data as JobApplication[];
}
