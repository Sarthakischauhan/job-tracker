import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const PATCH = async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    try {
        const supabase = await createClient();
        const { data: userData, error: userError } = await supabase.auth.getUser();

        if (userError || !userData.user) {
            return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
        }

        const { status } = await request.json();
        const jobId = params.id;

        if (!status) {
            return NextResponse.json({ error: "Status is required" }, { status: 400 });
        }

        // Update the job status
        const { data, error } = await supabase
            .from("job_applications")
            .update({ status })
            .eq("id", jobId)
            .eq("user_id", userData.user.id) // Ensure user owns this job
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: "Failed to update job status" }, { status: 500 });
        }

        return NextResponse.json({ data, status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
};

export const DELETE = async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    try {
        const supabase = await createClient();
        const { data: userData, error: userError } = await supabase.auth.getUser();

        if (userError || !userData.user) {
            return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
        }

        const jobId = params.id;

        // Delete the job application
        const { error } = await supabase
            .from("job_applications")
            .delete()
            .eq("id", jobId)
            .eq("user_id", userData.user.id); // Ensure user owns this job

        if (error) {
            return NextResponse.json({ error: "Failed to delete job application" }, { status: 500 });
        }

        return NextResponse.json({ message: "Job application deleted successfully", status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
};
