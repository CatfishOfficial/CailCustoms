import Link from "next/link";
import { redirect } from "next/navigation";
import { Wrench, Inbox, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "admin", robots: { index: false, follow: false } };

// The admin landing hub — pick between managing the shop content and the
// orders/ideas inbox. Shows how much is waiting so you know where to go.
export default async function AdminHubPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const [ordersRes, ideasRes] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("idea_submissions").select("id", { count: "exact", head: true }).eq("status", "new"),
  ]);
  const waiting = (ordersRes.count || 0) + (ideasRes.count || 0);

  return (
    <section className="admin">
      <div className="admin-bar">
        <div>
          <span className="admin-eyebrow">admin · {user.email}</span>
          <h1 className="admin-title">Where to?</h1>
        </div>
        <div className="admin-actions">
          <Link className="adm-primary" href="/"><ArrowLeft size={14} /> view site</Link>
        </div>
      </div>

      <div className="hub-cards">
        <Link className="hub-card" href="/admin/manage">
          <Wrench size={26} />
          <b>manage the shop</b>
          <em>products, categories, hero images, site copy</em>
        </Link>
        <Link className="hub-card" href="/admin/orders">
          <Inbox size={26} />
          <b>orders{waiting > 0 ? <span className="hub-badge">{waiting} new</span> : null}</b>
          <em>order requests + custom ideas, by status</em>
        </Link>
      </div>
    </section>
  );
}
