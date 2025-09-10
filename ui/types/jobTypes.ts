type JobApplication = {
  id: string
  user_id?: string
  job_title: string
  company: string
  description: string | null
  job_url: string | null
  applied_at: string
  required_skills: string[]
  preferred_skills: string[]
  experience_level: string | null
  salary_range: string | null
  remote_option: "remote" | "onsite"
  ai_summary: string | null
  // Not sure yet
  status: JobStatus
}

type JobStatus = "applied" | "rejected" | "interview" | "oa"

export type {
    JobApplication, 
    JobStatus
}