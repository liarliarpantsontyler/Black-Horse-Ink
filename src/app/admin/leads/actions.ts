"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { leadStatusSchema } from "@/lib/leads/schema";

export async function updateLeadStatus(leadId: string, status: string) {
  const parsed = leadStatusSchema.safeParse(status);
  if (!parsed.success) return { error: "Invalid status" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({ status: parsed.data })
    .eq("id", leadId);

  if (error) return { error: error.message };
  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin/leads");
  return { ok: true };
}
