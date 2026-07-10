import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OrdersClient from "@/components/admin/OrdersClient";

export const metadata = { title: "orders", robots: { index: false, follow: false } };

export default async function AdminOrdersPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const [ordersRes, ideasRes] = await Promise.all([
    supabase.from("orders").select("*").order("created_at", { ascending: false }),
    supabase.from("idea_submissions").select("*").order("created_at", { ascending: false }),
  ]);

  // Idea files live in the private "submissions" bucket — sign URLs here (1h)
  // so staff can open them. Links re-sign on every page load.
  const ideas = ideasRes.data || [];
  const allPaths = ideas.flatMap((i) => (Array.isArray(i.files) ? i.files : []));
  let signed = {};
  if (allPaths.length) {
    const { data: urls } = await supabase.storage.from("submissions").createSignedUrls(allPaths, 3600);
    for (const u of urls || []) {
      if (u.signedUrl && !u.error) signed[u.path] = u.signedUrl;
    }
  }
  const ideasWithFiles = ideas.map((i) => ({
    ...i,
    files: (Array.isArray(i.files) ? i.files : []).map((path) => ({ path, url: signed[path] || "" })),
  }));

  return <OrdersClient initialOrders={ordersRes.data || []} initialIdeas={ideasWithFiles} userEmail={user.email} />;
}
