"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { siteConfig, getArtistById } from "@/content/site.config";
import { useQuote } from "@/context/QuoteContext";
import { getAttribution } from "@/lib/attribution";
import { trackEvent } from "@/lib/analytics";
import { maskPhone } from "@/lib/phone";
import { Button } from "@/components/ui/Button";
import {
  PLACEMENT_OPTIONS,
  SIZE_OPTIONS,
  TIMING_OPTIONS,
  type LeadSize,
} from "./types";
import { UploadReferences } from "./UploadReferences";

type Step =
  | "intro"
  | "artist"
  | "idea"
  | "size"
  | "placement"
  | "references"
  | "timing"
  | "contact"
  | "success";

export function QuoteFlow() {
  const {
    isOpen,
    closeQuote,
    draft,
    updateDraft,
    presetArtistId,
    clearDraft,
    submittedPhone,
    setSubmittedPhone,
  } = useQuote();
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState<Step>("intro");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [website, setWebsite] = useState("");
  const [successArtistName, setSuccessArtistName] = useState<string | null>(null);

  const artistId = draft.artistId ?? presetArtistId;

  useEffect(() => {
    if (!isOpen) {
      setStep("intro");
      setError(null);
      setFiles([]);
    }
  }, [isOpen]);

  const stepOrder: Step[] = useMemo(() => {
    const base: Step[] = ["intro"];
    if (!artistId && !draft.artistId) base.push("artist");
    base.push("idea", "size", "placement", "references", "timing", "contact");
    return base;
  }, [artistId, draft.artistId]);

  const progressIndex = stepOrder.indexOf(step);

  const selectedArtistId =
    draft.artistId && draft.artistId.length > 0
      ? draft.artistId
      : artistId && artistId.length > 0
        ? artistId
        : undefined;
  const responseTimeLine = selectedArtistId
    ? siteConfig.copy.artistResponseTimeTemplate.replace(
        "{{artistName}}",
        getArtistById(selectedArtistId)?.name ?? siteConfig.studio.name,
      )
    : siteConfig.copy.responseTimeCopy;

  function next(current: Step) {
    const idx = stepOrder.indexOf(current);
    const n = stepOrder[idx + 1];
    if (n) setStep(n);
  }

  function back(current: Step) {
    const idx = stepOrder.indexOf(current);
    const p = stepOrder[idx - 1];
    if (p) setStep(p);
  }

  async function submit() {
    setError(null);
    setSubmitting(true);
    try {
      const form = new FormData();
      form.set("firstName", draft.firstName ?? "");
      form.set("phone", draft.phone ?? "");
      form.set("email", draft.email ?? "");
      form.set("artistId", draft.artistId ?? artistId ?? "");
      form.set("idea", draft.idea ?? "");
      form.set("size", draft.size ?? "not_sure");
      form.set("placement", draft.placement ?? "Not sure");
      form.set("placementNotes", draft.placementNotes ?? "");
      form.set("timing", draft.timing ?? "");
      form.set("website", website);
      form.set("attribution", JSON.stringify(getAttribution()));
      files.forEach((f) => form.append("references", f));

      const res = await fetch("/api/leads", { method: "POST", body: form });
      const data = (await res.json()) as { ok?: boolean; error?: string; phoneMasked?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Something went wrong. Try again.");
      }
      trackEvent("quote_completed", {
        artist_id: draft.artistId ?? artistId ?? "unsure",
      });
      const resolvedArtist =
        getArtistById(draft.artistId ?? artistId ?? "")?.name ??
        siteConfig.studio.name;
      setSuccessArtistName(resolvedArtist);
      setSubmittedPhone(data.phoneMasked ?? maskPhone(draft.phone ?? ""));
      clearDraft();
      setStep("success");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submit failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) return null;

  const transition = reduceMotion ? { duration: 0 } : { duration: 0.25 };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center md:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        aria-label="Close quote"
        onClick={closeQuote}
      />
      <motion.div
        initial={reduceMotion ? false : { y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={transition}
        className="relative flex max-h-[95dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-border/60 bg-background md:max-h-[90vh] md:max-w-lg md:rounded-3xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-title"
      >
        <div className="border-b border-border/50 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap gap-1.5" aria-hidden>
                {stepOrder.map((s, i) => (
                  <span
                    key={s}
                    className={[
                      "h-1.5 w-6 rounded-full",
                      i <= progressIndex ? "bg-accent" : "bg-border",
                    ].join(" ")}
                  />
                ))}
              </div>
              {step !== "success" && (
                <p className="mt-2 text-xs font-medium leading-snug text-response-highlight">
                  {responseTimeLine}
                </p>
              )}
            </div>
            <button
              type="button"
              className="min-h-10 shrink-0 px-2 text-sm text-muted"
              onClick={closeQuote}
            >
              Close
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6 pb-28 md:pb-6">
          <AnimatePresence mode="wait">
            {step === "intro" && (
              <StepPanel key="intro">
                <h2 id="quote-title" className="font-display text-3xl">
                  Let&apos;s see what you&apos;re thinking 👋
                </h2>
                <p className="mt-3 text-muted">
                  A few quick questions and we&apos;ll text you back.
                </p>
                <Button
                  type="button"
                  fullWidth
                  className="mt-8"
                  onClick={() => {
                    trackEvent("quote_started");
                    next("intro");
                  }}
                >
                  Let&apos;s go
                </Button>
              </StepPanel>
            )}

            {step === "artist" && (
              <StepPanel key="artist">
                <h2 className="font-display text-2xl">Who are you thinking about working with?</h2>
                <div className="mt-6 grid gap-3">
                  {siteConfig.artists.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      className="rounded-2xl border border-border bg-surface p-4 text-left hover:border-accent/50"
                      onClick={() => {
                        updateDraft({ artistId: a.id });
                        trackEvent("artist_selected", { artist_id: a.id, source: "flow" });
                        next("artist");
                      }}
                    >
                      <p className="font-medium">{a.name}</p>
                      <p className="text-sm text-muted">
                        {a.id === "lucia"
                          ? "Fine-line + small"
                          : a.id === "juan"
                            ? "Small + medium"
                            : "Large projects"}
                      </p>
                    </button>
                  ))}
                  <button
                    type="button"
                    className="rounded-2xl border border-dashed border-border p-4 text-left text-muted"
                    onClick={() => {
                      updateDraft({ artistId: "" });
                      next("artist");
                    }}
                  >
                    Not sure — route me to the right artist
                  </button>
                </div>
              </StepPanel>
            )}

            {step === "idea" && (
              <StepPanel key="idea">
                <h2 className="font-display text-2xl">What are you thinking about getting?</h2>
                <textarea
                  className="mt-4 min-h-36 w-full rounded-2xl border border-border bg-surface p-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  placeholder="Snake wrapping around my forearm, mostly black with a few fine details..."
                  value={draft.idea ?? ""}
                  onChange={(e) => updateDraft({ idea: e.target.value })}
                />
                <NavRow
                  onBack={() => back("idea")}
                  onNext={() => {
                    if ((draft.idea?.trim().length ?? 0) < 3) {
                      setError("Tell us a little more — even a rough idea helps.");
                      return;
                    }
                    setError(null);
                    next("idea");
                  }}
                />
              </StepPanel>
            )}

            {step === "size" && (
              <StepPanel key="size">
                <h2 className="font-display text-2xl">About how big?</h2>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {SIZE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className={[
                        "min-h-[4.5rem] rounded-2xl border p-3 text-left",
                        draft.size === opt.id
                          ? "border-accent bg-accent/10"
                          : "border-border bg-surface",
                      ].join(" ")}
                      onClick={() => updateDraft({ size: opt.id as LeadSize })}
                    >
                      <p className="font-medium">{opt.label}</p>
                      <p className="text-xs text-muted">{opt.hint}</p>
                    </button>
                  ))}
                </div>
                <NavRow
                  onBack={() => back("size")}
                  onNext={() => {
                    if (!draft.size) updateDraft({ size: "not_sure" });
                    next("size");
                  }}
                />
              </StepPanel>
            )}

            {step === "placement" && (
              <StepPanel key="placement">
                <h2 className="font-display text-2xl">Where&apos;s it going?</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {PLACEMENT_OPTIONS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={[
                        "min-h-11 rounded-full px-4 text-sm",
                        draft.placement === p
                          ? "bg-accent text-background"
                          : "border border-border text-muted",
                      ].join(" ")}
                      onClick={() => updateDraft({ placement: p })}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <input
                  className="mt-4 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm"
                  placeholder="Anything else about placement? (optional)"
                  value={draft.placementNotes ?? ""}
                  onChange={(e) => updateDraft({ placementNotes: e.target.value })}
                />
                <NavRow
                  onBack={() => back("placement")}
                  onNext={() => {
                    if (!draft.placement) updateDraft({ placement: "Not sure" });
                    next("placement");
                  }}
                />
              </StepPanel>
            )}

            {step === "references" && (
              <StepPanel key="references">
                <h2 className="font-display text-2xl">Got inspiration?</h2>
                <p className="mt-2 text-sm text-muted">
                  Upload anything that helps us understand the idea. Screenshots are totally fine.
                </p>
                <div className="mt-4">
                  <UploadReferences files={files} onChange={setFiles} />
                </div>
                <NavRow
                  onBack={() => back("references")}
                  onNext={() => next("references")}
                  nextLabel="Continue"
                />
                <button
                  type="button"
                  className="mt-3 w-full text-center text-sm text-muted underline-offset-4 hover:underline"
                  onClick={() => next("references")}
                >
                  Skip for now
                </button>
              </StepPanel>
            )}

            {step === "timing" && (
              <StepPanel key="timing">
                <h2 className="font-display text-2xl">When are you hoping to get it?</h2>
                <p className="text-sm text-muted">Optional — no wrong answer.</p>
                <div className="mt-4 grid gap-2">
                  {TIMING_OPTIONS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={[
                        "min-h-12 rounded-xl border px-4 text-left text-sm",
                        draft.timing === t.id
                          ? "border-accent bg-accent/10"
                          : "border-border",
                      ].join(" ")}
                      onClick={() => updateDraft({ timing: t.id })}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <NavRow
                  onBack={() => back("timing")}
                  onNext={() => next("timing")}
                  nextLabel="Continue"
                />
              </StepPanel>
            )}

            {step === "contact" && (
              <StepPanel key="contact">
                <h2 className="font-display text-2xl">Where should we text you?</h2>
                <div className="mt-4 space-y-3">
                  <label className="block text-sm">
                    First name
                    <input
                      required
                      autoComplete="given-name"
                      className="mt-1 w-full rounded-xl border border-border bg-surface px-4 py-3"
                      value={draft.firstName ?? ""}
                      onChange={(e) => updateDraft({ firstName: e.target.value })}
                    />
                  </label>
                  <label className="block text-sm">
                    Mobile number
                    <input
                      required
                      type="tel"
                      autoComplete="tel"
                      inputMode="tel"
                      className="mt-1 w-full rounded-xl border border-border bg-surface px-4 py-3"
                      value={draft.phone ?? ""}
                      onChange={(e) => updateDraft({ phone: e.target.value })}
                    />
                  </label>
                  <label className="block text-sm">
                    Email <span className="text-muted">(optional)</span>
                    <input
                      type="email"
                      autoComplete="email"
                      className="mt-1 w-full rounded-xl border border-border bg-surface px-4 py-3"
                      value={draft.email ?? ""}
                      onChange={(e) => updateDraft({ email: e.target.value })}
                    />
                  </label>
                  <input
                    tabIndex={-1}
                    autoComplete="off"
                    className="hidden"
                    name="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>
                <p className="mt-4 text-xs leading-relaxed text-muted">
                  {siteConfig.copy.smsConsent}{" "}
                  <Link href="/privacy" className="underline">
                    Privacy Policy
                  </Link>
                </p>
                {error && (
                  <p className="mt-3 text-sm text-red-400" role="alert">
                    {error}
                  </p>
                )}
                <Button
                  type="button"
                  fullWidth
                  className="mt-6"
                  disabled={submitting}
                  onClick={submit}
                >
                  {submitting ? "Sending…" : siteConfig.copy.submitQuoteCta}
                </Button>
                <p className="mt-3 text-center text-xs text-muted">
                  We&apos;ll only use this to respond to your tattoo request.
                </p>
                <button
                  type="button"
                  className="mt-4 w-full text-sm text-muted"
                  onClick={() => back("contact")}
                >
                  Back
                </button>
              </StepPanel>
            )}

            {step === "success" && (
              <StepPanel key="success">
                <h2 className="font-display text-3xl">We got it 🤘</h2>
                <p className="mt-4 text-muted">
                  {successArtistName ?? siteConfig.studio.name} has your idea. We&apos;ll text
                  you at {submittedPhone ?? "your number"}.
                </p>
                <p className="mt-3 text-sm text-muted">
                  Keep an eye on your texts. We&apos;ll follow up with pricing, availability, or
                  any questions.
                </p>
                <p className="mt-4 text-xs text-muted">
                  Need to send something else? Just reply to the text when it arrives.
                </p>
                <div className="mt-8 flex flex-col gap-2">
                  <Button type="button" variant="secondary" fullWidth onClick={closeQuote}>
                    View more work
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    fullWidth
                    onClick={() => {
                      trackEvent("instagram_click");
                      window.open(siteConfig.studio.instagram, "_blank");
                    }}
                  >
                    Instagram
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    fullWidth
                    onClick={() => {
                      trackEvent("directions_click");
                      window.open(siteConfig.studio.mapsUrl, "_blank");
                    }}
                  >
                    Get Directions
                  </Button>
                </div>
              </StepPanel>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function StepPanel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

function NavRow({
  onBack,
  onNext,
  nextLabel = "Next",
}: {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
}) {
  return (
    <div className="mt-8 flex gap-3">
      <Button type="button" variant="secondary" className="flex-1" onClick={onBack}>
        Back
      </Button>
      <Button type="button" className="flex-1" onClick={onNext}>
        {nextLabel}
      </Button>
    </div>
  );
}
