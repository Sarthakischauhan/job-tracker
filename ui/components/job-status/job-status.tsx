import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { JobStatus } from "@/types/jobTypes"
import { Dispatch, SetStateAction } from "react"
import { getStatusEmoji } from "@/lib/utils"

type JobStatusDialogProp = {
    openJobStatus: JobStatus | null, 
    setOpenJobStatus: Dispatch<SetStateAction<JobStatus | null>>,
    currentJobId?: string,
    onStatusUpdate?: () => void
}

export const JobStatusDialog = (
    {openJobStatus, setOpenJobStatus, currentJobId, onStatusUpdate}: JobStatusDialogProp
) => {
    const handleStatusClick = async (newStatus: JobStatus) => {
        if (!currentJobId) return;
        
        try {
            const response = await fetch(`/api/jobs/${currentJobId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to update job status');
            }
            
            setOpenJobStatus(null);
            onStatusUpdate?.();
        } catch (error) {
            console.error("Error updating job status:", error);
        }
    };

    return (
        <Dialog open={!!openJobStatus} onOpenChange={() => setOpenJobStatus(null)}>
            <DialogContent className="bg-black justify-center border border-white/20 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl text-center">
                        Where we at?    
                    </DialogTitle>
                </DialogHeader>
                <div className="flex flex-row justify-center gap-5">
                    {(["applied", "interview", "oa", "rejected"] as JobStatus[]).map((status) => (
                        <div className="flex flex-col justify-center">
                            <button
                                key={status}
                                onClick={() => handleStatusClick(status)}
                                className={`text-3xl transition-opacity duration-200 hover:scale-110 ${
                                    openJobStatus === status ? 'opacity-100' : 'opacity-40'
                                }`}
                            >
                                {getStatusEmoji(status)}
                            </button>
                            <p className={`text-sm text-center ${
                                    openJobStatus === status ? 'opacity-100' : 'opacity-40'
                                }`}>{status}</p>
                        </div>
                    ))}
                </div>
                <DialogDescription>
                    Change the current status by clicking on the emoticons
                </DialogDescription>
            </DialogContent>
        </Dialog>
    );
}