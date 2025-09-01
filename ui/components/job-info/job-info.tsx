import { Dispatch, SetStateAction } from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog"
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ExternalLink } from "lucide-react";

import { formatDate, getSkillColor } from "@/lib/utils";
import { JobApplication } from "@/types/jobTypes";

// Props for component
type JobInfoDialogProps = {
    openJob: JobApplication | null, 
    setOpenJob: Dispatch<SetStateAction<JobApplication | null>>
};

// Dialog to show job info to user.
export const JobInfoDialog = (
    {openJob, setOpenJob}: JobInfoDialogProps
) => (
    <>
    <Dialog open={!!openJob} onOpenChange={() => setOpenJob(null)}>
        <DialogContent className="bg-black border border-white/20 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
            <DialogTitle className="text-xl">{openJob?.job_title}</DialogTitle>
            <DialogDescription className="text-white/70">
            {openJob?.company} • Applied {openJob?.applied_at ? formatDate(openJob.applied_at) : ""}
            </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
            {/* Quick Info */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white/5 rounded">
                <div className="text-sm text-white/60">Work Type</div>
                <div className="font-medium">{openJob?.remote_option === "remote" ? "Remote" : "On-site"}</div>
            </div>
            {openJob?.experience_level && (
                <div className="text-center p-3 bg-white/5 rounded">
                <div className="text-sm text-white/60">Experience</div>
                <div className="font-medium">{openJob.experience_level}</div>
                </div>
            )}
            {openJob?.salary_range && (
                <div className="text-center p-3 bg-white/5 rounded">
                <div className="text-sm text-white/60">Salary</div>
                <div className="font-medium">{openJob.salary_range}</div>
                </div>
            )}
            </div>

            {/* AI Summary */}
            {openJob?.ai_summary && (
            <div>
                <h3 className="font-medium mb-2">AI Summary</h3>
                <div className="bg-white/5 p-4 rounded border-l-2 border-white">
                <p className="text-white/80">{openJob.ai_summary}</p>
                </div>
            </div>
            )}

            {/* Description */}
            {openJob?.description && (
            <div>
                <h3 className="font-medium mb-2">Job Description</h3>
                <div className="bg-white/5 p-4 rounded">
                <p className="text-white/80 whitespace-pre-wrap">{openJob.description}</p>
                </div>
            </div>
            )}

            {/* Skills */}
            <div className="space-y-4">
            {(openJob?.required_skills?.length || 0) > 0 && (
                <div>
                <h3 className="font-medium mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                    {openJob?.required_skills?.map((skill, index) => (
                    <Badge key={skill} className={`${getSkillColor(skill)} text-white`}>
                        {skill}
                    </Badge>
                    ))}
                </div>
                </div>
            )}
            {(openJob?.preferred_skills?.length || 0) > 0 && (
                <div>
                <h3 className="font-medium mb-2">Preferred Skills</h3>
                <div className="flex flex-wrap gap-2">
                    {openJob?.preferred_skills?.map((skill, index) => (
                    <Badge key={skill} variant="outline" className={`${getSkillColor(skill)} opacity-75`}>
                        {skill}
                    </Badge>
                    ))}
                </div>
                </div>
            )}
            </div>

            {openJob?.job_url && (
            <div className="pt-4 border-t border-white/20">
                <a
                href={openJob.job_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
                >
                View Original Job Posting <ExternalLink className="w-4 h-4" />
                </a>
            </div>
            )}
        </div>
        <DialogClose asChild>
            <Button className="mt-6 w-full bg-white text-black hover:bg-white/90">Close</Button>
        </DialogClose>
        </DialogContent>
    </Dialog>
    </>
);
