import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = 'PropFlow <noreply@propflow.ma>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://propflow.ma';

// ─── Exported send functions ────────────────────────────────────────────────

export async function sendBookingRequestEmail(
  to: string,
  data: {
    decoratorName: string;
    renterName: string;
    propTitle: string;
    startDate: string;
    endDate: string;
    totalPrice: number;
    bookingId: string;
  }
) {
  if (!process.env.RESEND_API_KEY) return;
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `New booking request: ${data.propTitle}`,
      html: bookingRequestHtml(data),
    });
  } catch {
    // Email failure must never break the API
  }
}

export async function sendBookingConfirmedEmail(
  to: string,
  data: {
    renterName: string;
    propTitle: string;
    startDate: string;
    endDate: string;
    totalPrice: number;
    bookingId: string;
    decoratorName: string;
  }
) {
  if (!process.env.RESEND_API_KEY) return;
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `Booking confirmed: ${data.propTitle}`,
      html: bookingConfirmedHtml(data),
    });
  } catch {
    // Email failure must never break the API
  }
}

export async function sendBookingCancelledEmail(
  to: string,
  data: {
    recipientName: string;
    propTitle: string;
    startDate: string;
    endDate: string;
    bookingId: string;
  }
) {
  if (!process.env.RESEND_API_KEY) return;
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `Booking cancelled: ${data.propTitle}`,
      html: bookingCancelledHtml(data),
    });
  } catch {
    // Email failure must never break the API
  }
}

export async function sendReviewReceivedEmail(
  to: string,
  data: {
    recipientName: string;
    reviewerName: string;
    rating: number;
    comment: string;
    propTitle: string;
  }
) {
  if (!process.env.RESEND_API_KEY) return;
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `New review from ${data.reviewerName}`,
      html: reviewReceivedHtml(data),
    });
  } catch {
    // Email failure must never break the API
  }
}

// ─── Shared layout helpers ───────────────────────────────────────────────────

function emailWrapper(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#080708;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#080708;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:#0f0e0f;border:1px solid #2a2820;border-bottom:2px solid #D4A832;padding:28px 36px;">
              <span style="font-family:Georgia,serif;font-size:26px;font-weight:700;color:#D4A832;letter-spacing:0.04em;">PropFlow</span>
              <span style="font-family:Arial,sans-serif;font-size:11px;color:#6b6455;letter-spacing:0.15em;text-transform:uppercase;margin-left:12px;">Cinema Props Morocco</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background:#0f0e0f;border:1px solid #2a2820;border-top:none;border-bottom:none;padding:36px;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#080708;border:1px solid #2a2820;border-top:2px solid #1e1c17;padding:20px 36px;text-align:center;">
              <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#4a4438;letter-spacing:0.1em;text-transform:uppercase;">
                PropFlow &middot; Morocco&rsquo;s Cinema Prop Marketplace
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(href: string, label: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:28px 0 0;">
    <tr>
      <td style="background:#D4A832;border-radius:2px;">
        <a href="${href}" style="display:inline-block;padding:13px 28px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#1a1207;text-decoration:none;letter-spacing:0.08em;text-transform:uppercase;">${label}</a>
      </td>
    </tr>
  </table>`;
}

function infoRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:10px 16px;font-family:Arial,sans-serif;font-size:11px;color:#8a7d68;letter-spacing:0.12em;text-transform:uppercase;white-space:nowrap;width:140px;">${label}</td>
    <td style="padding:10px 16px;font-family:Arial,sans-serif;font-size:14px;color:#EDE8DE;">${value}</td>
  </tr>`;
}

function infoTable(rows: [string, string][]): string {
  return `<table cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #2a2820;border-radius:2px;margin:20px 0;">
    ${rows.map(([l, v]) => infoRow(l, v)).join('<tr><td colspan="2" style="border-top:1px solid #1e1c17;padding:0;height:1px;font-size:1px;">&nbsp;</td></tr>')}
  </table>`;
}

// ─── HTML Templates ──────────────────────────────────────────────────────────

function bookingRequestHtml(data: {
  decoratorName: string;
  renterName: string;
  propTitle: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  bookingId: string;
}): string {
  const body = `
    <h1 style="margin:0 0 6px;font-family:Georgia,serif;font-size:22px;font-weight:700;color:#EDE8DE;">New Booking Request</h1>
    <p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:14px;color:#8a7d68;letter-spacing:0.04em;">Hi ${data.decoratorName}, someone wants to book your prop.</p>
    ${infoTable([
      ['Prop', data.propTitle],
      ['Renter', data.renterName],
      ['Check-in', data.startDate],
      ['Check-out', data.endDate],
      ['Total', `${data.totalPrice.toLocaleString('en-MA')} MAD`],
    ])}
    <p style="margin:20px 0 0;font-family:Arial,sans-serif;font-size:13px;color:#8a7d68;line-height:1.6;">
      Review the request and accept or decline it from your dashboard.
    </p>
    ${ctaButton(`${APP_URL}/bookings/${data.bookingId}`, 'Review Request')}
  `;
  return emailWrapper(body);
}

function bookingConfirmedHtml(data: {
  renterName: string;
  propTitle: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  bookingId: string;
  decoratorName: string;
}): string {
  const body = `
    <h1 style="margin:0 0 6px;font-family:Georgia,serif;font-size:22px;font-weight:700;color:#D4A832;">Booking Confirmed</h1>
    <p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:14px;color:#8a7d68;letter-spacing:0.04em;">Hi ${data.renterName}, your booking has been confirmed.</p>
    ${infoTable([
      ['Prop', data.propTitle],
      ['Decorator', data.decoratorName],
      ['Check-in', data.startDate],
      ['Check-out', data.endDate],
      ['Total', `${data.totalPrice.toLocaleString('en-MA')} MAD`],
    ])}
    <p style="margin:20px 0 0;font-family:Arial,sans-serif;font-size:13px;color:#8a7d68;line-height:1.6;">
      You can view your booking details, contact the decorator, and manage your rental from the link below.
    </p>
    ${ctaButton(`${APP_URL}/bookings/${data.bookingId}`, 'View Booking')}
  `;
  return emailWrapper(body);
}

function bookingCancelledHtml(data: {
  recipientName: string;
  propTitle: string;
  startDate: string;
  endDate: string;
  bookingId: string;
}): string {
  const body = `
    <h1 style="margin:0 0 6px;font-family:Georgia,serif;font-size:22px;font-weight:700;color:#EDE8DE;">Booking Cancelled</h1>
    <p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:14px;color:#8a7d68;letter-spacing:0.04em;">Hi ${data.recipientName}, a booking has been cancelled.</p>
    ${infoTable([
      ['Prop', data.propTitle],
      ['Check-in', data.startDate],
      ['Check-out', data.endDate],
      ['Booking ID', data.bookingId],
    ])}
    <p style="margin:20px 0 0;font-family:Arial,sans-serif;font-size:13px;color:#8a7d68;line-height:1.6;">
      If you have questions or believe this was an error, please visit your dashboard.
    </p>
    ${ctaButton(`${APP_URL}/bookings/${data.bookingId}`, 'View Booking')}
  `;
  return emailWrapper(body);
}

function reviewReceivedHtml(data: {
  recipientName: string;
  reviewerName: string;
  rating: number;
  comment: string;
  propTitle: string;
}): string {
  const stars = '★'.repeat(data.rating) + '☆'.repeat(5 - data.rating);
  const body = `
    <h1 style="margin:0 0 6px;font-family:Georgia,serif;font-size:22px;font-weight:700;color:#EDE8DE;">New Review</h1>
    <p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:14px;color:#8a7d68;letter-spacing:0.04em;">Hi ${data.recipientName}, ${data.reviewerName} left you a review.</p>
    ${infoTable([
      ['Prop', data.propTitle],
      ['Reviewer', data.reviewerName],
      ['Rating', `<span style="color:#D4A832;font-size:16px;letter-spacing:2px;">${stars}</span> (${data.rating}/5)`],
    ])}
    ${data.comment ? `
    <blockquote style="margin:20px 0 0;padding:16px 20px;background:#0a0909;border-left:3px solid #D4A832;border-radius:2px;">
      <p style="margin:0;font-family:Georgia,serif;font-size:14px;color:#EDE8DE;line-height:1.7;font-style:italic;">&ldquo;${data.comment}&rdquo;</p>
    </blockquote>` : ''}
    <p style="margin:20px 0 0;font-family:Arial,sans-serif;font-size:13px;color:#8a7d68;line-height:1.6;">
      Reviews help build trust on PropFlow. Keep up the great work!
    </p>
  `;
  return emailWrapper(body);
}
