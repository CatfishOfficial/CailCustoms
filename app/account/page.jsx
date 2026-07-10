import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AccountClient from "./AccountClient";

export const metadata = { title: "my account", robots: { index: false, follow: false } };

export default async function AccountPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/account/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, address")
    .eq("id", user.id)
    .maybeSingle();

  return <AccountClient user={user} profile={profile} />;
}
