import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const GET = async () => {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser()

    if (error){
        return NextResponse.json({error: "Something went wrong! No response", status:400})
    }

    const userID = data?.user?.id
    
    if (!userID) {
        return NextResponse.json({error: "User not authenticated", status:401})
    }

    // query supabase to get all jobs for the authenticated user
    const { data: jobData, error: jobError } = await supabase
        .from("job_applications")
        .select("*")
        // .eq("user_id", userID)
        .order("applied_at", { ascending: false });

    if (jobError){
        return NextResponse.json({error: "Something went wrong! No response", status:400})
    }

    const { data: countJobs, error: countError } = await supabase
    .from("count_all_jobs")
    .select("active_jobs")

    if (countError){
        return NextResponse.json({error: "Something went wrong! No response", status:400})
    }

    return NextResponse.json({data: {jobs:jobData, active:countJobs.at(0)?.active_jobs} , status: 200});
}

export const POST = async (request: NextRequest) => {
    try {
        const supabase = await createClient();
        const { data: userData, error: userError } = await supabase.auth.getUser();

        if (userError || !userData.user) {
            return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
        }

        const jobData = await request.json();

        if (!jobData.job_title || !jobData.company) {
            return NextResponse.json({ error: "Job title and company are required" }, { status: 400 });
        }

        // Create the job application
        const { data, error } = await supabase
            .from("job_applications")
            .insert([{ ...jobData, user_id: userData.user.id }])
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: "Failed to create job application" }, { status: 500 });
        }

        return NextResponse.json({ data, status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
};