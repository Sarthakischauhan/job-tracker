// Get user details from here like name and other information
import { createClient } from "@/lib/supabase/server"
import { NextResponse, NextRequest} from "next/server";

export const GET = async () => {
    const supabase = await createClient();

    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData.user) {
        return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const userId = userData.user.id
    
    return NextResponse.json({email:userData.user.email})
}