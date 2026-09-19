"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient, hasSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export function AdminLoginForm() {
  const params = useSearchParams();
  const error = params.get("error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!hasSupabaseClient()) {
      setMessage("Supabase is not configured.");
      return;
    }
    setLoading(true);
    setMessage(null);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (signInError) {
      setMessage(signInError.message);
      return;
    }
    window.location.href = "/admin/leads";
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <h1 className="font-display text-3xl">Studio login</h1>
      <p className="mt-2 text-sm text-muted">Leads admin for Black Horse Ink.</p>
      {error === "forbidden" && (
        <p className="mt-4 text-sm text-red-400">This account is not authorized for admin.</p>
      )}
      {error === "config" && (
        <p className="mt-4 text-sm text-red-400">Supabase environment variables are missing.</p>
      )}
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block text-sm">
          Email
          <input
            type="email"
            required
            className="mt-1 w-full rounded-xl border border-border bg-surface px-4 py-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          Password
          <input
            type="password"
            required
            className="mt-1 w-full rounded-xl border border-border bg-surface px-4 py-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {message && (
          <p className="text-sm text-red-400" role="alert">
            {message}
          </p>
        )}
        <Button type="submit" fullWidth disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <Link href="/" className="mt-8 text-center text-sm text-muted hover:text-foreground">
        Back to site
      </Link>
    </div>
  );
}
