import Link from "next/link";
import { createClient, hasSupabaseServer } from "@/lib/supabase/server";
import { getArtistById } from "@/content/site.config";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  if (!hasSupabaseServer()) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <p className="text-muted">Configure Supabase env vars to view leads.</p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: leads, error } = await supabase
    .from("leads")
    .select("id, created_at, first_name, phone_e164, artist_id, idea, status, utm_source, sms_sync_status")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <p className="text-red-400">Could not load leads: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl">Leads</h1>
        <Link href="/" className="text-sm text-muted hover:text-foreground">
          View site
        </Link>
      </div>
      <div className="mt-8 overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border bg-surface text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Artist</th>
              <th className="px-4 py-3 font-medium">Idea</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">SMS</th>
              <th className="px-4 py-3 font-medium">Source</th>
            </tr>
          </thead>
          <tbody>
            {(leads ?? []).map((lead) => (
              <tr key={lead.id} className="border-b border-border/50">
                <td className="px-4 py-3">
                  <Link href={`/admin/leads/${lead.id}`} className="underline-offset-2 hover:underline">
                    {lead.first_name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted">
                  {new Date(lead.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  {lead.artist_id
                    ? getArtistById(lead.artist_id)?.name ?? lead.artist_id
                    : "—"}
                </td>
                <td className="max-w-[200px] truncate px-4 py-3 text-muted">{lead.idea}</td>
                <td className="px-4 py-3 font-mono text-xs">{lead.phone_e164}</td>
                <td className="px-4 py-3">{lead.status}</td>
                <td className="px-4 py-3">{lead.sms_sync_status}</td>
                <td className="px-4 py-3 text-muted">{lead.utm_source ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!leads?.length && (
          <p className="px-4 py-8 text-center text-muted">No leads yet.</p>
        )}
      </div>
    </div>
  );
}
