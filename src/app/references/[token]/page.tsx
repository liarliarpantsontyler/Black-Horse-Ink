import Image from "next/image";
import { notFound } from "next/navigation";
import { createAdminClient, hasSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Reference photos | Black Horse Ink",
  robots: { index: false, follow: false },
  referrer: "no-referrer" as const,
};

export default async function ReferencePhotos({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token) || !hasSupabaseAdmin()) notFound();
  const db = createAdminClient();
  const { data: lead, error } = await db.from("leads").select("id").eq("lead_detail_token", token).maybeSingle();
  if (error || !lead) notFound();
  const { data: images, error: imageError } = await db.from("lead_images")
    .select("storage_path").eq("lead_id", lead.id).order("sort_order");
  if (imageError) throw new Error("Could not load reference photos");
  const photos = await Promise.all((images ?? []).map(async (image) => {
    const { data, error } = await db.storage.from("lead-references").createSignedUrl(image.storage_path, 3600);
    if (error || !data) throw new Error("Could not load a reference photo");
    return data.signedUrl;
  }));
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="font-display text-3xl">Tattoo reference photos</h1>
      <p className="mt-3 text-sm text-muted">Shared with Black Horse Ink. Keep this link private.</p>
      <div className="mt-8 space-y-6">
        {photos.map((url, index) => (
          <a key={index} href={url} target="_blank" rel="noreferrer">
            <Image src={url} alt={`Tattoo reference ${index + 1}`} width={2000} height={2000}
              unoptimized className="mb-6 h-auto w-full rounded-xl" />
          </a>
        ))}
      </div>
    </main>
  );
}
