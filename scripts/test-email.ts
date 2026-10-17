// Checks the quote-email setup in .env.local and sends one sample quote to
// every QUOTE_TO_EMAIL recipient.  Run with:  npm run email:test
import nodemailer from "nodemailer";

const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS?.replace(/\s+/g, "");
const to = (process.env.QUOTE_TO_EMAIL || user || "")
  .split(/[,;\s]+/)
  .filter(Boolean);

async function main() {
  if (!user || !pass) {
    console.error("✗ SMTP_USER or SMTP_PASS is empty in .env.local.");
    return process.exit(1);
  }

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: Number(process.env.SMTP_PORT || 465) === 465,
    auth: { user, pass },
  });

  try {
    await transport.verify();
    console.log(`✓ Signed in to Google as ${user}`);
  } catch (err) {
    console.error(`✗ Google rejected the login for ${user}:`, (err as Error).message);
    console.error(
      "  Check that SMTP_PASS is the App Password (not your normal password) and that it was made on this same account."
    );
    return process.exit(1);
  }

  const info = await transport.sendMail({
    from: { name: "Yubi Demolition Website", address: user },
    to,
    replyTo: { name: "Test Customer", address: user },
    subject: "TEST — New quote request — Concrete Cutting — Test Customer (Test Pty Ltd)",
    text: [
      "This is a test from `npm run email:test`. Real quote emails look like this.",
      "",
      "Name: Test Customer",
      "Company: Test Pty Ltd",
      "Email: test@example.com",
      "Phone: +61 412 555 019",
      "Service: Concrete Cutting",
      "",
      "Message:",
      "Two door openings to cut in a concrete wall at our Silverwater site.",
    ].join("\n"),
  });

  console.log(`✓ Sent to: ${to.join(", ")}`);
  console.log(`  Google accepted: ${info.accepted.join(", ") || "none"}`);
  if (info.rejected.length) console.log(`  Rejected: ${info.rejected.join(", ")}`);
}

main();
