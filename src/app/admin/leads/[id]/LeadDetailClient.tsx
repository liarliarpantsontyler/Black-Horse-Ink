"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { updateLeadStatus } from "../actions";

type Props = {
  leadId: string;
  status: string;
  smsSyncStatus: string;
  signedImages: { url: string; path: string }[];
  confirmationPreview: string;
};

export function LeadDetailClient({
  leadId,
  status: initialStatus,
  smsSyncStatus,
  signedImages,
  confirmationPreview,
}: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [smsStatus, setSmsStatus] = useState(smsSyncStatus);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function setLeadStatus(next: string) {
    setBusy(true);
    const res = await updateLeadStatus(leadId, next);
    setBusy(false);
    if (res.error) setMessage(res.error);
    else setStatus(next);
  }

  async function retrySms() {
    setBusy(true);
    setMessage(null);
    const res = await fetch(`/api/admin/leads/${leadId}/retry-sms`, { method: "POST" });
    const data = (await res.json()) as { ok?: boolean; error?: string; status?: string };
    setBusy(false);
    if (!res.ok || !data.ok) setMessage(data.error ?? "Retry failed");
    else setSmsStatus(data.status ?? "sent");
  }

  return (
    <div className="mt-8 space-y-8">
      <div className="flex flex-wrap gap-2">
        {["new", "contacted", "quoted", "booked", "lost"].map((s) => (
          <Button
            key={s}
            type="button"
            variant={status === s ? "primary" : "secondary"}
            disabled={busy}
            onClick={() => setLeadStatus(s)}
          >
            {s}
          </Button>
        ))}
      </div>

      <section>
        <h2 className="text-lg font-medium">SMS</h2>
        <p className="mt-2 text-sm text-muted">Status: {smsStatus}</p>
        <p className="mt-3 rounded-xl bg-surface p-4 text-sm text-muted">{confirmationPreview}</p>
        <p className="mt-2 text-xs text-muted">
          Quo API does not support MMS — open reference images below when replying from the shared
          number.
        </p>
        {smsStatus === "failed" && (
          <Button type="button" className="mt-4" disabled={busy} onClick={retrySms}>
            Retry SMS sync
          </Button>
        )}
      </section>

      {signedImages.length > 0 && (
        <section>
          <h2 className="text-lg font-medium">References</h2>
          <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
            {signedImages.map((img) => (
              <li key={img.path} className="relative aspect-square overflow-hidden rounded-lg">
                <Image src={img.url} alt="" fill className="object-cover" unoptimized />
              </li>
            ))}
          </ul>
        </section>
      )}

      {message && (
        <p className="text-sm text-red-400" role="alert">
          {message}
        </p>
      )}
    </div>
  );
}
