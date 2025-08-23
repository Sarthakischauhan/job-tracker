export type JobDataProps = {
    description: string;
    job_url: string;
    applied_at: string;
    // optional fields for AI analysed description.
    job_title?: string;
    company?: string;
    required_skills?: string[];
    preferred_skills?: string[];
    experience_level?: string,
    salary_range?: string;
    remote_option?: "remote" | "onsite" | "hybrid";
    ai_summary?: string; 
}

export type InferenceReturnProps = {
    jobTitle: string; 
    company: string;
    experienceRequired: string;
    jobDesc: string;
    skillsRequired: string[]; 
    skillsPreferred: string[]; 
    salaryRange: string;
    remote: "remote" | "onsite" | "hybrid";
}
