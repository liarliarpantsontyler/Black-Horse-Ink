type StaffEmail = {
  to: string;
  subject: string;
  text: string;
};

export async function sendStaffEmail(payload: StaffEmail) {
  const provider = process.env.EMAIL_PROVIDER ?? "mock";
  if (provider === "mock") {
    console.info("[MockEmail] sendStaffEmail", payload);
    return;
  }

  if (provider === "resend") {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("EMAIL_PROVIDER=resend requires RESEND_API_KEY");
    }
    const from =
      process.env.RESEND_FROM ??
      `${siteName()} <onboarding@resend.dev>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [payload.to],
        subject: payload.subject,
        text: payload.text,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Resend failed: ${res.status} ${body}`);
    }
    return;
  }

  throw new Error(`Unknown EMAIL_PROVIDER: ${provider}`);
}

function siteName() {
  return "Black Horse Ink";
}
