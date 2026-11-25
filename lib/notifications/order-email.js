import "server-only";
import nodemailer from "nodemailer";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getSmtpConfig() {
  const provider = process.env.EMAIL_PROVIDER?.trim().toLowerCase();
  if (provider && provider !== "smtp") {
    throw new Error(`Unsupported EMAIL_PROVIDER "${provider}". Use "smtp".`);
  }

  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const fromEmail = process.env.SMTP_FROM_EMAIL?.trim();
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL?.trim();
  const username = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const secureValue = process.env.SMTP_SECURE?.trim().toLowerCase();

  if (!host || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("SMTP_HOST and a valid SMTP_PORT are required.");
  }
  if (!fromEmail || !EMAIL_PATTERN.test(fromEmail)) {
    throw new Error("SMTP_FROM_EMAIL must be a valid email address.");
  }
  if (!adminEmail || !EMAIL_PATTERN.test(adminEmail)) {
    throw new Error("ADMIN_NOTIFICATION_EMAIL must be a valid email address.");
  }
  if (Boolean(username) !== Boolean(password)) {
    throw new Error("Set both SMTP_USER and SMTP_PASSWORD, or leave both empty.");
  }
  if (secureValue && secureValue !== "true" && secureValue !== "false") {
    throw new Error("SMTP_SECURE must be either true or false.");
  }

  return {
    host,
    port,
    secure: secureValue ? secureValue === "true" : port === 465,
    auth: username ? { user: username, pass: password } : undefined,
    from: {
      name: process.env.SMTP_FROM_NAME?.trim() || "Best Homz",
      address: fromEmail,
    },
    adminEmail,
  };
}

async function sendEmails(messages) {
  const config = getSmtpConfig();
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });

  try {
    const results = await Promise.allSettled(
      messages.map(({ to, ...message }) =>
        transporter.sendMail({
          ...message,
          from: config.from,
          to: to === "admin" ? config.adminEmail : to,
        }),
      ),
    );
    const failures = results
      .filter((result) => result.status === "rejected")
      .map((result) => result.reason);

    if (failures.length) {
      throw new AggregateError(failures, `${failures.length} notification email(s) failed.`);
    }

    return { sent: messages.length };
  } finally {
    transporter.close();
  }
}

function orderSummary(order) {
  const orderNumber = order?.order_number || order?.id || "Not available";
  const total = Number(order?.total);
  const totalLine = Number.isFinite(total)
    ? `Total: ${order?.currency || "INR"} ${total.toFixed(2)}`
    : null;
  return [
    `Order: ${orderNumber}`,
    totalLine,
    order?.billing_address?.name ? `Customer: ${order.billing_address.name}` : null,
    order?.customer_email || order?.billing_address?.email
      ? `Email: ${order.customer_email || order.billing_address.email}`
      : null,
    order?.billing_address?.phone ? `Phone: ${order.billing_address.phone}` : null,
  ].filter(Boolean).join("\n");
}

export async function notifyOrderConfirmed(order) {
  const customerEmail =
    order?.customer_email || order?.billing_address?.email || order?.email;
  const summary = orderSummary(order);
  const messages = [
    {
      to: "admin",
      subject: `New paid order ${order?.order_number || ""}`.trim(),
      text: `A customer order has been paid and confirmed.\n\n${summary}`,
    },
  ];

  if (customerEmail) {
    messages.push({
      to: customerEmail,
      subject: `Your Best Homz order ${order?.order_number || ""} is confirmed`.trim(),
      text: `Thank you for your order with Best Homz. Your payment has been received.\n\n${summary}\n\nWe will keep you updated as your order progresses.`,
    });
  }

  return sendEmails(messages);
}

export async function notifyOrderShipped(order) {
  const customerEmail = order?.billing_address?.email || order?.customer_email;
  if (!customerEmail) {
    throw new Error("Cannot send shipping notification: customer email is missing.");
  }

  return sendEmails([{
    to: customerEmail,
    subject: `Your Best Homz order ${order?.order_number || ""} has shipped`.trim(),
    text: `Your Best Homz order has shipped.\n\n${orderSummary(order)}\n\nThank you for choosing Best Homz.`,
  }]);
}

export async function notifyContactEnquiry(enquiry) {
  const customerEmail = enquiry?.email;
  const subject = enquiry?.subject || "General enquiry";
  const details = [
    `Name: ${enquiry?.name || "Not provided"}`,
    `Email: ${customerEmail || "Not provided"}`,
    `Phone: ${enquiry?.phone || "Not provided"}`,
    `Subject: ${subject}`,
    "",
    "Message:",
    enquiry?.message || "",
  ].join("\n");
  const messages = [{
    to: "admin",
    replyTo: customerEmail || undefined,
    subject: `New website enquiry: ${subject}`,
    text: details,
  }];

  if (customerEmail) {
    messages.push({
      to: customerEmail,
      subject: "We received your enquiry — Best Homz",
      text: `Hello ${enquiry?.name || "there"},\n\nThank you for contacting Best Homz. We have received your enquiry and our team will get back to you.\n\nYour message:\n${enquiry?.message || ""}\n\nBest Homz`,
    });
  }

  return sendEmails(messages);
}
