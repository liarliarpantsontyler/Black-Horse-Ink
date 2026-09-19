"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { trackEvent } from "@/lib/analytics";
import type { LeadSize } from "@/components/quote/types";

const STORAGE_KEY = "bhi_quote_draft";

export type QuoteDraft = {
  artistId?: string;
  idea?: string;
  size?: LeadSize;
  placement?: string;
  placementNotes?: string;
  timing?: string;
  firstName?: string;
  phone?: string;
  email?: string;
};

type QuoteContextValue = {
  isOpen: boolean;
  presetArtistId?: string;
  draft: QuoteDraft;
  openQuote: (artistId?: string) => void;
  closeQuote: () => void;
  updateDraft: (patch: Partial<QuoteDraft>) => void;
  clearDraft: () => void;
  submittedPhone?: string;
  setSubmittedPhone: (phone: string | undefined) => void;
};

const QuoteContext = createContext<QuoteContextValue | null>(null);

function loadDraft(): QuoteDraft {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as QuoteDraft) : {};
  } catch {
    return {};
  }
}

export function QuoteProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [presetArtistId, setPresetArtistId] = useState<string | undefined>();
  const [draft, setDraft] = useState<QuoteDraft>({});
  const [submittedPhone, setSubmittedPhone] = useState<string | undefined>();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setDraft(loadDraft());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft, hydrated]);

  const openQuote = useCallback((artistId?: string) => {
    setPresetArtistId(artistId);
    if (artistId) {
      setDraft((d) => ({ ...d, artistId }));
      trackEvent("artist_selected", { artist_id: artistId, source: "cta" });
    }
    setIsOpen(true);
    trackEvent("quote_opened");
  }, []);

  const closeQuote = useCallback(() => {
    setIsOpen(false);
    setSubmittedPhone(undefined);
  }, []);

  const updateDraft = useCallback((patch: Partial<QuoteDraft>) => {
    setDraft((d) => ({ ...d, ...patch }));
  }, []);

  const clearDraft = useCallback(() => {
    setDraft({});
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      presetArtistId,
      draft,
      openQuote,
      closeQuote,
      updateDraft,
      clearDraft,
      submittedPhone,
      setSubmittedPhone,
    }),
    [
      isOpen,
      presetArtistId,
      draft,
      openQuote,
      closeQuote,
      updateDraft,
      clearDraft,
      submittedPhone,
    ],
  );

  return (
    <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>
  );
}

export function useQuote() {
  const ctx = useContext(QuoteContext);
  if (!ctx) throw new Error("useQuote must be used within QuoteProvider");
  return ctx;
}
