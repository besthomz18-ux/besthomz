"use server";

import { createClientOptional } from "@/lib/supabase/server";
import { createContactMessage } from "@/lib/services/contact";
import { notifyContactEnquiry } from "@/lib/notifications/order-email";
import { FORM_LIMITS, trimField } from "@/lib/validation/forms";

export async function submitContactMessage(formData) {
  const name = trimField(formData.get("name"), FORM_LIMITS.name);
  const phone = trimField(formData.get("phone"), FORM_LIMITS.phone);
  const email = trimField(formData.get("email"), FORM_LIMITS.email);
  const subject = trimField(formData.get("subject"), FORM_LIMITS.shortText);
  const message = trimField(formData.get("message"), FORM_LIMITS.message);

  if (!name || !message) {
    return { ok: false, error: "Name and message are required." };
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  const supabase = await createClientOptional();
  if (!supabase) {
    return { ok: false, error: "Unable to send message. Please call us directly." };
  }

  const { data: enquiry, error } = await createContactMessage(supabase, {
    name,
    phone: phone || null,
    email: email || null,
    subject: subject || null,
    message,
  });

  if (error) return { ok: false, error: error.message };

  try {
    await notifyContactEnquiry(enquiry);
    return { ok: true };
  } catch (emailError) {
    console.error("[email] Failed to send contact enquiry notification", {
      enquiryId: enquiry.id,
      error: emailError,
    });
    return {
      ok: true,
      emailWarning: "Your enquiry was received, but its email notification could not be sent.",
    };
  }
}
