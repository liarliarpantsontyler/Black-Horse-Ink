import { Suspense } from "react";
import { AdminLoginForm } from "./AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-4 py-24 text-muted">Loading…</div>}>
      <AdminLoginForm />
    </Suspense>
  );
}
