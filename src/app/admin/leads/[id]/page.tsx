import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, hasSupabaseAdmin } from "@/lib/supabase/admin";
import { hasSupabaseServer } from "@/lib/supabase/server";
import { getArtistById, siteConfig } from "@/content/site.config";
import { renderConfirmationSms } from "@/lib/sms";
import { LeadDetailClient } from "./LeadDetailClient";

type Props = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export default async function AdminLeadDetailPage({ params }: Props) {
  const { id } = await params;

  if (!hasSupabaseServer()) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-muted">
        Configure Supabase env vars to view lead details.
      </div>
    );
  }

  const supabase = await createClient();
  const { data: lead, error } = await supabase.from("leads").select("*").eq("id", id).maybeSingle();

  if (error || !lead) notFound();

  const { data: images } = await supabase
    .from("lead_images")
    .select("storage_path")
    .eq("lead_id", id)
    .order("sort_order");

  const signedImages = hasSupabaseAdmin()
    ? await Promise.all(
        (images ?? []).map(async (img) => {
          const admin = createAdminClient();
          const { data } = await admin.storage
            .from("lead-references")
            .createSignedUrl(img.storage_path, 3600);
          return { path: img.storage_path, url: data?.signedUrl ?? "" };
        }),
      )
    : [];

  const confirmationPreview = renderConfirmationSms(siteConfig.copy.confirmationSmsTemplate, {
    firstName: lead.first_name,
    studioName: siteConfig.studio.name,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/admin/leads" className="text-sm text-muted hover:text-foreground">
        ← All leads
      </Link>
      <h1 className="font-display mt-4 text-3xl">{lead.first_name}</h1>
      <p className="mt-2 text-sm text-muted">{new Date(lead.created_at).toLocaleString()}</p>

      <dl className="mt-8 space-y-4 text-sm">
        <div>
          <dt className="text-muted">Phone</dt>
          <dd className="font-mono">{lead.phone_e164}</dd>
        </div>
        {lead.email && (
          <div>
            <dt className="text-muted">Email</dt>
            <dd>{lead.email}</dd>
          </div>
        )}
        <div>
          <dt className="text-muted">Artist</dt>
          <dd>{lead.artist_id ? getArtistById(lead.artist_id)?.name ?? lead.artist_id : "Not sure"}</dd>
        </div>
        <div>
          <dt className="text-muted">Idea</dt>
          <dd className="whitespace-pre-wrap">{lead.idea}</dd>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-muted">Size</dt>
            <dd>{lead.size}</dd>
          </div>
          <div>
            <dt className="text-muted">Placement</dt>
            <dd>{lead.placement}</dd>
          </div>
        </div>
        {lead.placement_notes && (
          <div>
            <dt className="text-muted">Placement notes</dt>
            <dd>{lead.placement_notes}</dd>
          </div>
        )}
        {lead.timing && (
          <div>
            <dt className="text-muted">Timing</dt>
            <dd>{lead.timing}</dd>
          </div>
        )}
        <div>
          <dt className="text-muted">Attribution</dt>
          <dd className="text-muted">
            {lead.utm_source ?? "direct"} · {lead.landing_page ?? "—"}
            {lead.gclid ? ` · gclid` : ""}
          </dd>
        </div>
        {lead.quo_contact_id && (
          <div>
            <dt className="text-muted">Quo contact</dt>
            <dd className="font-mono text-xs">{lead.quo_contact_id}</dd>
          </div>
        )}
      </dl>

      <LeadDetailClient
        leadId={lead.id}
        status={lead.status}
        smsSyncStatus={lead.sms_sync_status}
        signedImages={signedImages.filter((s) => s.url)}
        confirmationPreview={confirmationPreview}
      />
    </div>
  );
}
