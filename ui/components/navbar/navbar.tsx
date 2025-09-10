// app/components/Navbar.tsx (Server Component)
import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@utils/supabase/server";
import { Button } from "@/components/ui/button";

export default async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Server Action runs on the server when the form posts
  async function signOutAction() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    // Option A: just redirect home
    redirect("/");
    // Option B (alternative): revalidate and stay put
    // revalidatePath("/", "layout");
  }

  return (
    <nav className="flex items-center justify-between px-6 py-4 container mx-auto p-6">
      <Link href="/" className="text-xl font-semibold">
        psy-psy-duck 
      </Link>

      <div className="flex gap-3">
        {!user ? (
          <>
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </>
        ) : (
          <form action={signOutAction}>
            <Button type="submit" variant="destructive">
              Logout
            </Button>
          </form>
        )}
      </div>
    </nav>
  );
}
