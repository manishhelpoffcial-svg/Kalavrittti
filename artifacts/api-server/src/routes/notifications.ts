import { Router } from "express";
import nodemailer from "nodemailer";
import https from "https";

// ─── Exported email utility (used by other routes) ────────────────────────────
export function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.ZOHO_SMTP_HOST || "smtp.zoho.in",
    port: Number(process.env.ZOHO_SMTP_PORT || 465),
    secure: true,
    auth: {
      user: process.env.ZOHO_FROM_EMAIL || "namaste@kalavritti.in",
      pass: process.env.ZOHO_APP_PASSWORD,
    },
  });
}
export async function sendEmail(to: string, subject: string, html: string) {
  const t = createTransporter();
  return t.sendMail({
    from: `"${process.env.ZOHO_FROM_NAME || "Kalavritti"}" <${process.env.ZOHO_FROM_EMAIL || "namaste@kalavritti.in"}>`,
    to, subject, html,
  });
}

const router = Router();

// ─── SMTP Transporter (local alias for backward compat) ───────────────────────
function localTransporter() {
  return createTransporter();
}

// ─── MSG91 WhatsApp helper (corrected component format) ───────────────────────
function sendWhatsApp(
 to: string,
 templateName: string,
 bodyParams: string[] = []
): Promise<{ ok: boolean; body: string }> {
 return new Promise((resolve) => {
 // MSG91 expects empty object `{}` when no params, array when params present
 const components: any = bodyParams.length
 ? [{ type: "body", parameters: bodyParams.map((text) => ({ type: "text", text })) }]
 : {};

 const payload = JSON.stringify({
 integrated_number: process.env.MSG91_INTEGRATED_NUMBER || "919476211198",
 content_type: "template",
 payload: {
 messaging_product: "whatsapp",
 type: "template",
 template: {
 name: templateName,
 language: { code: "en", policy: "deterministic" },
 namespace: null,
 to_and_components: [{ to: [to], components }],
 },
 },
 });

 const req = https.request(
 {
 hostname: "api.msg91.com",
 path: "/api/v5/whatsapp/whatsapp-outbound-message/bulk/",
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 "Content-Length": Buffer.byteLength(payload),
 authkey: process.env.MSG91_AUTH_KEY || "",
 },
 },
 (res) => {
 let body = "";
 res.on("data", (d) => (body += d));
 res.on("end", () => resolve({ ok: res.statusCode === 200, body }));
 }
 );
 req.on("error", (e) => resolve({ ok: false, body: e.message }));
 req.write(payload);
 req.end();
 });
}

// ─── Brand email base wrapper ─────────────────────────────────────────────────
function emailBase(bodyHtml: string, previewText = "") {
 return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Kalavritti</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
<style>
 body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
 table,td{mso-table-lspace:0pt;mso-table-rspace:0pt}
 body{margin:0;padding:0;background:#f5f0ea;font-family:'Segoe UI',Arial,Helvetica,sans-serif}
 .wrapper{max-width:600px;margin:0 auto;padding:32px 16px}
 .card{background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,0.09)}
 .header{background:linear-gradient(135deg,#7c2d12 0%,#9a3412 100%);padding:36px 32px;text-align:center}
 .header-logo{color:#ffffff;font-size:26px;font-weight:800;letter-spacing:0.5px;margin:0}
 .header-tagline{color:rgba(255,255,255,0.82);font-size:12px;margin:6px 0 0;letter-spacing:1.5px;text-transform:uppercase}
 .body{padding:36px 32px}
 .greeting{font-size:17px;font-weight:700;color:#111827;margin:0 0 8px}
 .text{font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 16px}
 .section-label{font-size:10px;font-weight:800;color:#9ca3af;letter-spacing:2px;text-transform:uppercase;margin:28px 0 12px}
 .badge{display:inline-block;border-radius:40px;padding:7px 22px;font-size:13px;font-weight:700;margin-bottom:22px}
 .badge-green{background:#f0fdf4;color:#16a34a;border:1.5px solid #bbf7d0}
 .badge-blue{background:#eff6ff;color:#2563eb;border:1.5px solid #bfdbfe}
 .badge-amber{background:#fffbeb;color:#d97706;border:1.5px solid #fde68a}
 .badge-red{background:#fef2f2;color:#dc2626;border:1.5px solid #fecaca}
 .badge-purple{background:#f5f3ff;color:#7c3aed;border:1.5px solid #ddd6fe}
 .divider{height:1px;background:#f3f4f6;margin:24px 0}
 .info-box{background:#f9f5f0;border-radius:10px;padding:18px 20px;margin:16px 0;font-size:13px;color:#374151;line-height:1.7}
 .info-box strong{color:#7c2d12}
 .cta-btn{display:inline-block;background:#7c2d12;color:#ffffff !important;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:14px;font-weight:700;letter-spacing:0.3px;margin:16px 0}
 .cta-secondary{display:inline-block;background:#f9f5f0;color:#7c2d12 !important;text-decoration:none;padding:12px 28px;border-radius:10px;font-size:13px;font-weight:600;border:2px solid #fcd9bd;margin:8px 0}
 table.items{width:100%;border-collapse:collapse;font-size:13px}
 table.items th{background:#f9f5f0;text-align:left;padding:11px 14px;font-size:11px;font-weight:700;color:#6b7280;letter-spacing:0.5px;border-bottom:2px solid #f3f4f6}
 table.items td{padding:13px 14px;border-bottom:1px solid #f9f5f0;color:#374151}
 table.items .total-row td{font-weight:800;color:#7c2d12;font-size:15px;border-top:2px solid #fcd9bd;border-bottom:none}
 .otp-box{text-align:center;background:linear-gradient(135deg,#fef9f0,#fff7ed);border:2px dashed #d97706;border-radius:14px;padding:28px;margin:24px 0}
 .otp-number{font-size:42px;font-weight:900;color:#7c2d12;letter-spacing:12px;margin:8px 0}
 .otp-note{font-size:12px;color:#9ca3af;margin:8px 0 0}
 .stat-row{display:flex;gap:12px;margin:16px 0;flex-wrap:wrap}
 .stat-box{flex:1;min-width:120px;background:#f9f5f0;border-radius:10px;padding:14px 16px;text-align:center}
 .stat-value{font-size:22px;font-weight:800;color:#7c2d12}
 .stat-label{font-size:11px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-top:3px}
 .artisan-card{background:linear-gradient(135deg,#fef9f0,#fff7ed);border:1px solid #fcd9bd;border-radius:12px;padding:20px;margin:16px 0;display:flex;gap:16px;align-items:flex-start}
 .alert-box{border-radius:10px;padding:16px 20px;margin:16px 0;font-size:13px;line-height:1.6}
 .alert-red{background:#fef2f2;border-left:4px solid #dc2626;color:#991b1b}
 .alert-amber{background:#fffbeb;border-left:4px solid #d97706;color:#92400e}
 .alert-green{background:#f0fdf4;border-left:4px solid #16a34a;color:#166534}
 .alert-blue{background:#eff6ff;border-left:4px solid #2563eb;color:#1e40af}
 .footer{background:#1c0a00;padding:28px 32px;text-align:center}
 .footer-links{margin:0 0 12px}
 .footer-links a{color:#d97706;text-decoration:none;font-size:12px;margin:0 8px}
 .footer-copy{color:#6b7280;font-size:11px;line-height:1.6;margin:0}
 .footer-copy a{color:#d97706;text-decoration:none}
 .unsubscribe{color:#4b5563;font-size:10px;margin:10px 0 0}
 .unsubscribe a{color:#6b7280;text-decoration:underline}
</style>
</head>
<body>
${previewText ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${previewText}</div>` : ""}
<div class="wrapper">
 <div class="card">
 <div class="header">
 <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse">
  <tr><td align="center" style="padding:0 0 14px">
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="23" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.35)" stroke-width="1.5"/>
      <path d="M24 11 C24 11,16 17,16 24 C16 28.4 19.6 32 24 32 C28.4 32 32 28.4 32 24 C32 17 24 11 24 11Z" fill="rgba(255,255,255,0.88)"/>
      <path d="M11 24 C11 24,17 17,24 17 C28.4 17 32 20.6 32 24 C32 28.4 28.4 32 24 32 C17 32 11 24 11 24Z" fill="rgba(255,255,255,0.55)"/>
      <path d="M37 24 C37 24,31 17,24 17 C19.6 17 16 20.6 16 24 C16 28.4 19.6 32 24 32 C31 32 37 24 37 24Z" fill="rgba(255,255,255,0.55)"/>
      <circle cx="24" cy="24" r="4" fill="rgba(255,255,255,0.9)"/>
    </svg>
  </td></tr>
 </table>
 <p class="header-logo">Kalavritti</p>
 <p class="header-tagline">Celebrating Handmade · Honouring Artisans</p>
 </div>
 ${bodyHtml}
 <div class="footer">
 <div class="footer-links">
 <a href="https://kalavritti.in">Shop Now</a>
 <a href="https://kalavritti.in/artisans">Our Artisans</a>
 <a href="https://kalavritti.in/blog">Blog</a>
 <a href="mailto:namaste@kalavritti.in">Contact</a>
 </div>
 <p class="footer-copy">
 © ${new Date().getFullYear()} Kalavritti · Celebrating Handmade from Bengal &amp; Assam<br />
 <a href="mailto:namaste@kalavritti.in">namaste@kalavritti.in</a> ·
 <a href="https://wa.me/919476211198">WhatsApp: +91 94762 11198</a>
 </p>
 <p class="unsubscribe"><a href="#">Unsubscribe</a> · <a href="https://kalavritti.in/privacy">Privacy Policy</a></p>
 </div>
 </div>
</div>
</body></html>`;
}


// ─── SVG icon helpers for email templates (email-safe inline SVG) ─────────────
const S = {
  check: (c = "#16a34a") => `<svg style="display:inline-block;vertical-align:middle;margin-right:5px" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  x:     (c = "#dc2626") => `<svg style="display:inline-block;vertical-align:middle;margin-right:5px" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  truck: () => `<svg style="display:inline-block;vertical-align:middle;margin-right:5px" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
  lock:  () => `<svg style="display:inline-block;vertical-align:middle;margin-right:5px" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1e40af" stroke-width="2" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  warn:  (c = "#d97706") => `<svg style="display:inline-block;vertical-align:middle;margin-right:5px" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  bell:  () => `<svg style="display:inline-block;vertical-align:middle;margin-right:5px" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  pkg:   (c = "#7c2d12") => `<svg style="display:inline-block;vertical-align:middle;margin-right:5px" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
  star:  () => `<svg style="display:inline-block;vertical-align:middle;margin-right:5px" width="15" height="15" viewBox="0 0 24 24" fill="#d97706" stroke="#d97706" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  rupee: () => `<svg style="display:inline-block;vertical-align:middle;margin-right:5px" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  mail:  () => `<svg style="display:inline-block;vertical-align:middle;margin-right:5px" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  cart:  () => `<svg style="display:inline-block;vertical-align:middle;margin-right:5px" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`,
  key:   () => `<svg style="display:inline-block;vertical-align:middle;margin-right:5px" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>`,
  chart: () => `<svg style="display:inline-block;vertical-align:middle;margin-right:5px" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  shield:() => `<svg style="display:inline-block;vertical-align:middle;margin-right:5px" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  ban:   () => `<svg style="display:inline-block;vertical-align:middle;margin-right:5px" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>`,
  gift:  (c = "#16a34a") => `<svg style="display:inline-block;vertical-align:middle;margin-right:5px" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>`,
  flash: () => `<svg style="display:inline-block;vertical-align:middle;margin-right:5px" width="15" height="15" viewBox="0 0 24 24" fill="#d97706" stroke="#d97706" stroke-width="1"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  flower:() => `<svg style="display:inline-block;vertical-align:middle;margin-right:5px" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round"><path d="M12 7.5a4.5 4.5 0 1 1 4.5 4.5M12 7.5A4.5 4.5 0 1 0 7.5 12M12 7.5V3"/><path d="M7.5 12a4.5 4.5 0 1 0 4.5 4.5M7.5 12H3"/><path d="M12 16.5a4.5 4.5 0 1 0 4.5-4.5M12 16.5V21"/><path d="M16.5 12a4.5 4.5 0 1 0-4.5-4.5"/><circle cx="12" cy="12" r="3"/></svg>`,
  clip:  () => `<svg style="display:inline-block;vertical-align:middle;margin-right:5px" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>`,
  undo:  () => `<svg style="display:inline-block;vertical-align:middle;margin-right:5px" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#92400e" stroke-width="2" stroke-linecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.08"/></svg>`,
  store: () => `<svg style="display:inline-block;vertical-align:middle;margin-right:5px" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2" stroke-linecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  tip:   () => `<svg style="display:inline-block;vertical-align:middle;margin-right:5px" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
};

// ─── Template functions ────────────────────────────────────────────────────────

function tplOrderConfirmed({ customerName = "Customer", orderId = "#KL-0000", items = [] as any[], total = 0, address = {} as any } = {}) {
 return emailBase(`
 <div class="body">
 <span class="badge badge-green">${S.check()} Order Confirmed</span>
 <p class="greeting">Namaste ${customerName} </p>
 <p class="text">Thank you for shopping with Kalavritti! Your order has been confirmed and the artisan has been notified. You'll receive a shipping update once your parcel is dispatched.</p>
 <div class="divider"></div>
 <p class="section-label">Order Details</p>
 <div class="info-box">
 <strong>Order ID:</strong> #${orderId}<br />
 <strong>Date:</strong> ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}<br />
 <strong>Payment:</strong> Confirmed
 </div>
 ${items.length ? `
 <table class="items">
 <thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead>
 <tbody>
 ${items.map((it: any) => `<tr><td>${it.name}</td><td>${it.qty || 1}</td><td>₹${Number(it.price || 0).toLocaleString("en-IN")}</td></tr>`).join("")}
 <tr class="total-row"><td colspan="2" style="text-align:right;padding:13px 14px">Grand Total</td><td>₹${Number(total).toLocaleString("en-IN")}</td></tr>
 </tbody>
 </table>` : ""}
 <p class="section-label">Delivery Address</p>
 <div class="info-box">${address.name || customerName}<br />${address.line1 || ""}${address.city ? `, ${address.city}` : ""}${address.state ? ` — ${address.state}` : ""}${address.pincode ? ` ${address.pincode}` : ""}</div>
 <a href="https://kalavritti.in/orders/${orderId}" class="cta-btn">Track Your Order →</a>
 <p class="text" style="margin-top:20px">Questions? Reply to this email or WhatsApp us at <a href="https://wa.me/919476211198" style="color:#d97706">+91 94762 11198</a></p>
 </div>`, "Your Kalavritti order is confirmed! Thank you for supporting handmade artisans.");
}

function tplOrderShipped({ customerName = "Customer", orderId = "#KL-0000", trackingNumber = "", courierName = "Delhivery", estimatedDelivery = "" } = {}) {
 return emailBase(`
 <div class="body">
 <span class="badge badge-blue">${S.truck()} Order Shipped</span>
 <p class="greeting">Your order is on its way, ${customerName}!</p>
 <p class="text">Great news! Your handcrafted treasures have been carefully packaged by the artisan and are now on their way to you.</p>
 <div class="info-box">
 <strong>Order ID:</strong> #${orderId}<br />
 ${trackingNumber ? `<strong>Tracking Number:</strong> ${trackingNumber}<br />` : ""}
 ${courierName ? `<strong>Courier Partner:</strong> ${courierName}<br />` : ""}
 ${estimatedDelivery ? `<strong>Expected Delivery:</strong> ${estimatedDelivery}` : ""}
 </div>
 ${trackingNumber ? `<a href="https://www.delhivery.com/track/package/${trackingNumber}" class="cta-btn">Track Shipment →</a>` : ""}
 <div class="alert-box alert-amber" style="margin-top:20px">
 <strong>Handle with care!</strong> Your package contains handcrafted goods made with love by artisans from Bengal and Assam.
 </div>
 </div>`, "Your Kalavritti package is on its way! ");
}

function tplOrderDelivered({ customerName = "Customer", orderId = "#KL-0000" } = {}) {
 return emailBase(`
 <div class="body">
 <span class="badge badge-green">${S.check()} Delivered</span>
 <p class="greeting">Your order has arrived, ${customerName}!</p>
 <p class="text">We hope you love your handcrafted purchase from Kalavritti. Every piece is made with passion and tells the story of an artisan's craft passed down through generations.</p>
 <div class="info-box"><strong>Order ID:</strong> #${orderId}</div>
 <a href="https://kalavritti.in/review/${orderId}" class="cta-btn">Leave a Review </a>
 <p class="text" style="margin-top:20px">Your review helps the artisan grow and reach more customers. It takes just 30 seconds!</p>
 <div class="divider"></div>
 <p class="text">Not satisfied? <a href="https://kalavritti.in/returns/${orderId}" style="color:#d97706">Initiate a return within 7 days →</a></p>
 </div>`, "Your Kalavritti order has been delivered! ");
}

function tplOrderCancelled({ customerName = "Customer", orderId = "#KL-0000", reason = "", refundAmount = 0 } = {}) {
 return emailBase(`
 <div class="body">
 <span class="badge badge-red">${S.x()} Order Cancelled</span>
 <p class="greeting">Namaste ${customerName},</p>
 <p class="text">Your order <strong>#${orderId}</strong> has been cancelled as requested. We're sorry to see you go!</p>
 ${reason ? `<div class="info-box"><strong>Reason:</strong> ${reason}</div>` : ""}
 ${refundAmount ? `<div class="alert-box alert-green"> A refund of <strong>₹${Number(refundAmount).toLocaleString("en-IN")}</strong> has been initiated and will reflect in your account within 5–7 business days.</div>` : ""}
 <a href="https://kalavritti.in/shop" class="cta-btn">Continue Shopping →</a>
 <p class="text" style="margin-top:20px">Changed your mind? <a href="https://kalavritti.in/shop" style="color:#d97706">Browse our latest collection →</a></p>
 </div>`, "Your order cancellation has been processed.");
}

function tplRefundProcessed({ customerName = "Customer", orderId = "#KL-0000", refundAmount = 0, refundMethod = "original payment method" } = {}) {
 return emailBase(`
 <div class="body">
 <span class="badge badge-green">${S.rupee()} Refund Processed</span>
 <p class="greeting">Namaste ${customerName} </p>
 <p class="text">Your refund for order <strong>#${orderId}</strong> has been successfully processed.</p>
 <div class="otp-box">
 <p style="font-size:13px;color:#9ca3af;margin:0">Refund Amount</p>
 <p class="otp-number" style="letter-spacing:4px;font-size:34px">₹${Number(refundAmount).toLocaleString("en-IN")}</p>
 <p class="otp-note">Via: ${refundMethod} · 5–7 business days</p>
 </div>
 <p class="text">If you don't see the refund within 7 business days, please contact us and we'll resolve it immediately.</p>
 <a href="mailto:namaste@kalavritti.in" class="cta-btn">Contact Support →</a>
 </div>`, `Your refund of ₹${refundAmount} is on its way!`);
}

function tplReturnReceived({ customerName = "Customer", orderId = "#KL-0000", returnId = "" } = {}) {
 return emailBase(`
 <div class="body">
 <span class="badge badge-amber">${S.undo()} Return Received</span>
 <p class="greeting">Namaste ${customerName} </p>
 <p class="text">We've received your return request for order <strong>#${orderId}</strong>. Our team will review your request within 1–2 business days.</p>
 <div class="info-box">
 <strong>Order ID:</strong> #${orderId}<br />
 ${returnId ? `<strong>Return ID:</strong> ${returnId}<br />` : ""}
 <strong>Status:</strong> Under Review
 </div>
 <div class="alert-box alert-amber">
 Please keep the item in its original packaging until the return is approved and a pickup is scheduled.
 </div>
 <a href="https://kalavritti.in/orders/${orderId}" class="cta-btn">Track Return Status →</a>
 </div>`, "We've received your return request.");
}

function tplWelcomeEmail({ customerName = "Customer" } = {}) {
 return emailBase(`
 <div class="body">
 <span class="badge badge-amber">${S.flower()} Welcome to Kalavritti!</span>
 <p class="greeting">Namaste ${customerName}!</p>
 <p class="text">Welcome to Kalavritti — India's curated marketplace for authentic handmade crafts from Bengal and Assam. We are so delighted to have you with us!</p>
 <div class="info-box">
 <strong>What makes Kalavritti special?</strong><br /><br />
 <strong>${S.check()} 100% Authentic Handmade</strong> — Every product is crafted by skilled artisans<br />
 <strong>${S.flower()} Direct from Artisans</strong> — Your purchase directly supports the maker<br />
 <strong>${S.shield()} Quality Guaranteed</strong> — Curated for quality, authenticity, and fair trade<br />
 <strong>${S.pkg()} Secure Delivery</strong> — Carefully packaged to preserve every detail
 </div>
 <a href="https://kalavritti.in/shop" class="cta-btn">Explore Collection →</a>
 <a href="https://kalavritti.in/artisans" class="cta-secondary" style="margin-left:12px">Meet Our Artisans →</a>
 <div class="divider"></div>
 <p class="text" style="color:#9ca3af;font-size:12px">Use code <strong style="color:#7c2d12">WELCOME10</strong> for 10% off your first order!</p>
 </div>`, "Welcome to Kalavritti — Your journey with handmade begins ");
}

function tplNewsletterWelcome({ email = "" } = {}) {
 return emailBase(`
 <div class="body">
 <span class="badge badge-amber">${S.flower()} Subscribed!</span>
 <p class="greeting">Welcome to our community!</p>
 <p class="text">Thank you for subscribing to the Kalavritti newsletter. You'll be the first to know about new artisan collections, exclusive launches, festive offers, and the stories behind every craft.</p>
 <div class="info-box">
 <strong>What to expect in your inbox:</strong><br /><br />
 New collection launches and exclusive products<br />
 Artisan stories and craft heritage features<br />
 Flash sales and subscriber-exclusive offers<br />
 The Artisan Journal — our handcrafted blog
 </div>
 <a href="https://kalavritti.in/shop" class="cta-btn">Start Exploring →</a>
 <p class="text" style="margin-top:20px;color:#9ca3af;font-size:12px">Subscribed with: ${email}</p>
 </div>`, "You're now part of the Kalavritti family ");
}

function tplOtpVerification({ name = "User", otp = "------", purpose = "Verification" } = {}) {
 return emailBase(`
 <div class="body">
 <span class="badge badge-amber">${S.lock()} ${purpose} OTP</span>
 <p class="greeting">Namaste ${name} </p>
 <p class="text">Use the one-time password below to complete your ${purpose.toLowerCase()}. This OTP is valid for <strong>10 minutes</strong> and can only be used once.</p>
 <div class="otp-box">
 <p style="font-size:13px;color:#9ca3af;margin:0">Your OTP</p>
 <p class="otp-number">${otp}</p>
 <p class="otp-note">Valid for 10 minutes · Do not share with anyone</p>
 </div>
 <div class="alert-box alert-red">
 <strong>Security notice:</strong> Kalavritti will never ask for your OTP over phone or email. Never share this code with anyone.
 </div>
 <p class="text">If you didn't request this OTP, please ignore this email. Your account remains safe.</p>
 </div>`, `Your Kalavritti OTP: ${otp} — valid for 10 minutes`);
}

function tplPasswordReset({ name = "User", resetLink = "#" } = {}) {
 return emailBase(`
 <div class="body">
 <span class="badge badge-amber">${S.key()} Password Reset Request</span>
 <p class="greeting">Namaste ${name} </p>
 <p class="text">We received a request to reset the password for your Kalavritti account. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
 <a href="${resetLink}" class="cta-btn">Reset My Password →</a>
 <div class="alert-box alert-amber" style="margin-top:20px">
 If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
 </div>
 <p class="text" style="margin-top:16px;font-size:12px;color:#9ca3af">If the button doesn't work, copy this link into your browser:<br /><a href="${resetLink}" style="color:#d97706;word-break:break-all">${resetLink}</a></p>
 </div>`, "Reset your Kalavritti password — link expires in 1 hour");
}

function tplSellerApplicationReceived({ sellerName = "Applicant", businessName = "" } = {}) {
 return emailBase(`
 <div class="body">
 <span class="badge badge-blue">${S.clip()} Application Received</span>
 <p class="greeting">Namaste ${sellerName} </p>
 <p class="text">Thank you for applying to become a Kalavritti artisan partner! We've received your application${businessName ? ` for <strong>${businessName}</strong>` : ""} and our team will review it within <strong>2–3 business days</strong>.</p>
 <div class="info-box">
 <strong>What happens next?</strong><br /><br />
 Step 1: Our team reviews your application & KYC documents<br />
 Step 2: We may call for a brief verification (if needed)<br />
 Step 3: You receive approval confirmation via email & WhatsApp<br />
 Step 4: Access your seller dashboard and start listing products
 </div>
 <div class="alert-box alert-blue">
 Questions? Reach us at <a href="mailto:namaste@kalavritti.in" style="color:#2563eb">namaste@kalavritti.in</a> or WhatsApp <a href="https://wa.me/919476211198" style="color:#2563eb">+91 94762 11198</a>
 </div>
 </div>`, "We've received your Kalavritti seller application ");
}

function tplSellerApproved({ sellerName = "Artisan", businessName = "", dashboardLink = "https://kalavritti.in/seller" } = {}) {
 return emailBase(`
 <div class="body">
 <span class="badge badge-green">${S.check()} Application Approved</span>
 <p class="greeting">Congratulations, ${sellerName}! </p>
 <p class="text">We are thrilled to welcome <strong>${businessName || "your craft"}</strong> to the Kalavritti family! Your seller application has been approved and your account is now active.</p>
 <div class="info-box">
 <strong>Your seller account is ready:</strong><br /><br />
 Login to your Seller Dashboard<br />
 Add your first product listing<br />
 Set your prices and manage inventory<br />
 Track orders and earnings in real-time
 </div>
 <a href="${dashboardLink}" class="cta-btn">Go to Seller Dashboard →</a>
 <div class="alert-box alert-green" style="margin-top:20px">
 As a new seller, your first 3 listings will be <strong>featured on our homepage</strong> for 7 days!
 </div>
 </div>`, "Welcome to Kalavritti — Your seller account is approved! ");
}

function tplSellerRejected({ sellerName = "Applicant", reason = "requirements not met" } = {}) {
 return emailBase(`
 <div class="body">
 <span class="badge badge-red">${S.x()} Application Update</span>
 <p class="greeting">Namaste ${sellerName} </p>
 <p class="text">Thank you for your interest in becoming a Kalavritti artisan partner. After reviewing your application, we are unable to approve it at this time.</p>
 <div class="info-box"><strong>Reason:</strong> ${reason}</div>
 <p class="text">We encourage you to address the points above and re-apply after 30 days. Our team would be happy to guide you through the requirements.</p>
 <a href="mailto:namaste@kalavritti.in" class="cta-btn">Contact Us for Help →</a>
 <div class="alert-box alert-amber" style="margin-top:16px">
 <strong>Tip:</strong> Ensure your KYC documents are clear, products are original handmade crafts, and your business information is accurate.
 </div>
 </div>`, "Update on your Kalavritti seller application");
}

function tplPayoutSent({ sellerName = "Artisan", amount = 0, period = "", transactionId = "", bankAccount = "" } = {}) {
 return emailBase(`
 <div class="body">
 <span class="badge badge-green">${S.rupee()} Payout Sent</span>
 <p class="greeting">Namaste ${sellerName} </p>
 <p class="text">Your earnings payout from Kalavritti has been processed and sent to your bank account.</p>
 <div class="otp-box">
 <p style="font-size:13px;color:#9ca3af;margin:0">Payout Amount</p>
 <p class="otp-number" style="font-size:34px;letter-spacing:4px">₹${Number(amount).toLocaleString("en-IN")}</p>
 <p class="otp-note">${period ? `Period: ${period} · ` : ""}Expected in 1–3 business days</p>
 </div>
 <div class="info-box">
 ${transactionId ? `<strong>Transaction ID:</strong> ${transactionId}<br />` : ""}
 ${bankAccount ? `<strong>To Account:</strong> ****${bankAccount.slice(-4)}<br />` : ""}
 <strong>Date:</strong> ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
 </div>
 <p class="text">Keep creating beautiful crafts — your next payout cycle begins today! </p>
 <a href="https://kalavritti.in/seller/earnings" class="cta-btn">View Earnings Dashboard →</a>
 </div>`, `Kalavritti payout of ₹${amount} has been sent! `);
}

function tplReviewRequest({ customerName = "Customer", orderId = "#KL-0000", productName = "your purchase" } = {}) {
 return emailBase(`
 <div class="body">
 <span class="badge badge-amber">${S.star()} Share Your Experience</span>
 <p class="greeting">Namaste ${customerName} </p>
 <p class="text">We hope you're loving your <strong>${productName}</strong>! Your opinion matters a great deal — not just to us, but to the artisan who poured their heart into crafting it for you.</p>
 <div class="alert-box alert-amber" style="text-align:center;padding:24px">
 <p style="font-size:28px;margin:0 0 8px">⭐⭐⭐⭐⭐</p>
 <p style="font-size:14px;font-weight:700;color:#92400e;margin:0">How would you rate your experience?</p>
 </div>
 <a href="https://kalavritti.in/review/${orderId}" class="cta-btn">Write Your Review →</a>
 <p class="text" style="margin-top:16px;font-size:12px;color:#9ca3af">Takes only 30 seconds · Your review helps the artisan grow their craft </p>
 </div>`, `How was your ${productName} from Kalavritti? Share your review ⭐`);
}

function tplAbandonedCart({ customerName = "Customer", cartItems = [] as any[], cartTotal = 0 } = {}) {
 return emailBase(`
 <div class="body">
 <span class="badge badge-amber">${S.cart()} Items Waiting For You</span>
 <p class="greeting">Namaste ${customerName} </p>
 <p class="text">You left some beautiful handcrafted items in your cart. These are <strong>handmade in limited quantities</strong> — don't let them sell out!</p>
 ${cartItems.length ? `
 <table class="items" style="margin:16px 0">
 <thead><tr><th>Item</th><th>Price</th></tr></thead>
 <tbody>
 ${cartItems.map((it: any) => `<tr><td>${it.name}</td><td>₹${Number(it.price || 0).toLocaleString("en-IN")}</td></tr>`).join("")}
 ${cartTotal ? `<tr class="total-row"><td style="text-align:right;padding:13px 14px">Total</td><td>₹${Number(cartTotal).toLocaleString("en-IN")}</td></tr>` : ""}
 </tbody>
 </table>` : ""}
 <a href="https://kalavritti.in/cart" class="cta-btn">Complete My Purchase →</a>
 <div class="alert-box alert-green" style="margin-top:16px">
 Use code <strong>CART10</strong> for an extra 10% off — valid for 24 hours only!
 </div>
 </div>`, "Your handcrafted items are waiting! Don't let them sell out ");
}

function tplFlashSale({ title = "Flash Sale!", discount = "20", endsIn = "24 hours" } = {}) {
 return emailBase(`
 <div class="body">
 <span class="badge badge-red">${S.flash()} Flash Sale — ${discount}% Off!</span>
 <p class="greeting">${title}</p>
 <p class="text">For a limited time, enjoy <strong>${discount}% off</strong> on selected handcrafted collections from our finest artisans. Hurry — this offer ends in <strong>${endsIn}</strong>!</p>
 <div class="otp-box">
 <p style="font-size:12px;color:#9ca3af;margin:0 0 6px">Use coupon code</p>
 <p class="otp-number" style="font-size:28px;letter-spacing:8px;color:#d97706">FLASH${discount}</p>
 <p class="otp-note">Ends in: ${endsIn} · Limited stock</p>
 </div>
 <a href="https://kalavritti.in/sale" class="cta-btn" style="background:#d97706">Shop the Sale →</a>
 <p class="text" style="margin-top:16px;font-size:12px;color:#9ca3af">These are handmade products in limited quantities. Once sold, they're gone forever!</p>
 </div>`, ` ${discount}% Off Flash Sale — Ends in ${endsIn}!`);
}

function tplNewCollection({ collectionName = "New Collection", artisanName = "", description = "" } = {}) {
 return emailBase(`
 <div class="body">
 <span class="badge badge-purple">${S.flower()} New Arrival!</span>
 <p class="greeting">Something beautiful just arrived </p>
 <p class="text">We're excited to introduce <strong>${collectionName}</strong>${artisanName ? ` by artisan <strong>${artisanName}</strong>` : ""} — a stunning new addition to the Kalavritti family.</p>
 ${description ? `<p class="text">${description}</p>` : ""}
 <div class="info-box">
 ${S.check()} Authentically handcrafted<br />
 ${S.check("#d97706")} Sustainably sourced materials<br />
 ${S.star()} One-of-a-kind designs<br />
 ${S.pkg()} Ships within 3–5 business days
 </div>
 <a href="https://kalavritti.in/shop" class="cta-btn">Explore Collection →</a>
 </div>`, `New arrival: ${collectionName} is now on Kalavritti `);
}

function tplContactConfirmation({ name = "Guest", message = "" } = {}) {
 return emailBase(`
 <div class="body">
 <span class="badge badge-blue">${S.mail()} Message Received</span>
 <p class="greeting">Namaste ${name} </p>
 <p class="text">Thank you for reaching out to us! We've received your message and our team will get back to you within <strong>24 hours</strong> on business days.</p>
 ${message ? `<div class="info-box"><strong>Your message:</strong><br /><br />${message}</div>` : ""}
 <div class="info-box">
 <strong>For urgent queries, reach us directly:</strong><br /><br />
 <a href="mailto:namaste@kalavritti.in" style="color:#d97706">namaste@kalavritti.in</a><br />
 <a href="https://wa.me/919476211198" style="color:#d97706">+91 94762 11198 (WhatsApp)</a>
 </div>
 </div>`, "We've received your message — we'll reply within 24 hours ");
}

function tplAdminNewSeller({ sellerName = "New Seller", businessName = "", mobile = "" } = {}) {
 return emailBase(`
 <div class="body">
 <span class="badge badge-blue">${S.bell()} New Seller Application</span>
 <p class="greeting">Admin Alert</p>
 <p class="text">A new seller application has been submitted on Kalavritti and requires your review.</p>
 <div class="info-box">
 <strong>Seller Name:</strong> ${sellerName}<br />
 ${businessName ? `<strong>Business:</strong> ${businessName}<br />` : ""}
 ${mobile ? `<strong>Mobile:</strong> ${mobile}<br />` : ""}
 <strong>Applied:</strong> ${new Date().toLocaleString("en-IN")}
 </div>
 <a href="https://kalavritti.in/super-admin/sellers" class="cta-btn">Review Application →</a>
 </div>`, `New seller application from ${sellerName}`);
}

function tplAdminDailyReport({ date = "", totalRevenue = 0, totalOrders = 0, newCustomers = 0 } = {}) {
 return emailBase(`
 <div class="body">
 <span class="badge badge-blue">${S.chart()} Daily Revenue Report</span>
 <p class="greeting">Daily Summary — ${date || new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
 <div class="info-box">
 <div class="stat-row">
 <div class="stat-box"><div class="stat-value">₹${Number(totalRevenue).toLocaleString("en-IN")}</div><div class="stat-label">Revenue</div></div>
 <div class="stat-box"><div class="stat-value">${totalOrders}</div><div class="stat-label">Orders</div></div>
 <div class="stat-box"><div class="stat-value">${newCustomers}</div><div class="stat-label">New Customers</div></div>
 </div>
 </div>
 <a href="https://kalavritti.in/super-admin/financials" class="cta-btn">View Full Report →</a>
 </div>`, `Daily report — ₹${totalRevenue} revenue, ${totalOrders} orders`);
}

function tplSecurityAlert({ alertType = "Unauthorized Access", ip = "", time = "", email = "" } = {}) {
 return emailBase(`
 <div class="body">
 <span class="badge badge-red">${S.shield()} Security Alert</span>
 <p class="greeting">Admin Security Notice</p>
 <div class="alert-box alert-red">
 <strong> ${alertType}</strong><br />
 ${ip ? `IP Address: ${ip}<br />` : ""}
 ${email ? `Account: ${email}<br />` : ""}
 ${time ? `Time: ${time}` : `Time: ${new Date().toLocaleString("en-IN")}`}
 </div>
 <p class="text">Please review this activity immediately and take appropriate action to secure your platform.</p>
 <a href="https://kalavritti.in/super-admin" class="cta-btn">Go to Admin Panel →</a>
 </div>`, ` Security Alert: ${alertType}`);
}

function tplAccountSuspension({ name = "User", reason = "", reviewDate = "" } = {}) {
 return emailBase(`
 <div class="body">
 <span class="badge badge-red">${S.ban()} Account Suspended</span>
 <p class="greeting">Namaste ${name} </p>
 <p class="text">Your Kalavritti account has been temporarily suspended.</p>
 ${reason ? `<div class="info-box"><strong>Reason:</strong> ${reason}</div>` : ""}
 ${reviewDate ? `<p class="text">Your account will be reviewed on <strong>${reviewDate}</strong>. If reinstated, you will receive a confirmation email.</p>` : ""}
 <p class="text">If you believe this is an error, please contact us immediately.</p>
 <a href="mailto:namaste@kalavritti.in" class="cta-btn">Appeal Suspension →</a>
 </div>`, "Your Kalavritti account has been suspended");
}

function tplReinstatement({ name = "User" } = {}) {
 return emailBase(`
 <div class="body">
 <span class="badge badge-green">${S.check()} Account Reinstated</span>
 <p class="greeting">Welcome back, ${name}! </p>
 <p class="text">Great news! Your Kalavritti account has been reviewed and successfully reinstated. You now have full access to your account.</p>
 <a href="https://kalavritti.in" class="cta-btn">Log In to Kalavritti →</a>
 <p class="text" style="margin-top:16px">Please ensure all activities on your account comply with our <a href="https://kalavritti.in/terms" style="color:#d97706">Terms of Service</a> going forward.</p>
 </div>`, "Your Kalavritti account has been reinstated ");
}

// Template registry for the preview endpoint
// Keys cover both canonical names and frontend aliases
const EMAIL_TEMPLATES: Record<string, (params?: any) => string> = {
 order_confirmation: (p) => tplOrderConfirmed(p),
 order_shipped: (p) => tplOrderShipped(p),
 order_delivered: (p) => tplOrderDelivered(p),
 order_cancelled: (p) => tplOrderCancelled(p),
 refund_processed: (p) => tplRefundProcessed(p),
 return_request_received: (p) => tplReturnReceived(p),
 review_request: (p) => tplReviewRequest(p),
 abandoned_cart: (p) => tplAbandonedCart(p),
 welcome_email: (p) => tplWelcomeEmail(p),
 newsletter_welcome: (p) => tplNewsletterWelcome(p),
 otp_verification: (p) => tplOtpVerification(p),
 password_reset: (p) => tplPasswordReset(p),
 seller_application_received: (p) => tplSellerApplicationReceived(p),
 seller_approved: (p) => tplSellerApproved(p),
 seller_rejected: (p) => tplSellerRejected(p),
 seller_payout_processed: (p) => tplPayoutSent(p),
 contact_confirmation: (p) => tplContactConfirmation(p),
 flash_sale_announcement: (p) => tplFlashSale(p),
 new_collection_launch: (p) => tplNewCollection(p),
 account_suspension_notice: (p) => tplAccountSuspension(p),
 reinstatement_notice: (p) => tplReinstatement(p),
 new_seller_alert: (p) => tplAdminNewSeller(p),
 daily_revenue_report: (p) => tplAdminDailyReport(p),
 security_alert: (p) => tplSecurityAlert(p),
 unauthorized_login_alert: (p) => tplSecurityAlert({ alertType: "Unauthorized Login Attempt", ...p }),
 // Frontend name aliases (no duplicates of keys above)
 welcome: (p) => tplWelcomeEmail(p),
 welcome_new: (p) => tplWelcomeEmail(p),
 otp_login: (p) => tplOtpVerification({ ...p, purpose: "Login" }),
 password_reset_request: (p) => tplPasswordReset(p),
 order_processing: (p) => tplOrderConfirmed({ ...p, status: "Processing" }),
 order_dispatched: (p) => tplOrderShipped(p),
 order_out_for_delivery: (p) => tplOrderShipped({ ...p, courierName: "Out for Delivery" }),
 delivery_attempted: (p) => tplOrderShipped(p),
 return_approved: (p) => tplReturnReceived(p),
 return_rejected: (p) => tplOrderCancelled({ ...p, reason: "Return request rejected" }),
 exchange_confirmed: (p) => tplOrderConfirmed(p),
 kyc_verification_success: (p) => tplSellerApproved({ ...p, sellerName: p?.name }),
 payout_processed: (p) => tplPayoutSent(p),
 new_product_live: (p) => tplNewCollection(p),
 product_rejected: (p) => tplSellerRejected({ ...p, reason: "Product listing rejected" }),
 flash_sale: (p) => tplFlashSale(p),
 festive_offer: (p) => tplFlashSale({ ...p, title: "Festive Offer!" }),
 new_collection: (p) => tplNewCollection(p),
 artisan_spotlight_email: (p) => tplNewCollection({ ...p, collectionName: "Artisan Spotlight" }),
 exclusive_member_offer: (p) => tplFlashSale({ ...p, title: "Exclusive Member Offer!" }),
 wishlist_back_in_stock: (p) => tplAbandonedCart({ ...p, cartItems: [{ name: p?.productName || "Saved item", price: p?.price }] }),
 review_reminder: (p) => tplReviewRequest(p),
 contact_auto_reply: (p) => tplContactConfirmation(p),
 newsletter_subscription: (p) => tplNewsletterWelcome(p),
 account_deactivated: (p) => tplAccountSuspension({ name: p?.name }),
 new_seller_application: (p) => tplAdminNewSeller(p),
 weekly_revenue_report: (p) => tplAdminDailyReport({ ...p, date: "Weekly Summary" }),
 monthly_revenue_report: (p) => tplAdminDailyReport({ ...p, date: "Monthly Summary" }),
 server_alert: (p) => tplSecurityAlert({ alertType: "Server Alert", ...p }),
 backup_success: (p) => tplAdminDailyReport({ ...p, date: "Backup Completed" }),
 backup_failure: (p) => tplSecurityAlert({ alertType: "Backup Failure", ...p }),
 chargeback_alert: (p) => tplSecurityAlert({ alertType: "Chargeback Alert", ...p }),
 chargeback_alert_admin: (p) => tplSecurityAlert({ alertType: "Chargeback Alert (Admin)", ...p }),
 fraud_alert: (p) => tplSecurityAlert({ alertType: "Fraud Alert Detected", ...p }),
 product_approval_required: (p) => tplAdminNewSeller({ ...p, sellerName: p?.seller_name }),
 refund_approval_required: (p) => tplSecurityAlert({ alertType: "Refund Approval Required", ...p }),
 maintenance_notice: (p) => tplSecurityAlert({ alertType: "Scheduled Maintenance", ...p }),
 terms_update: (p) => tplReinstatement({ ...p, name: "Valued Customer" }),
 privacy_policy_update: (p) => tplReinstatement({ ...p, name: "Valued Customer" }),
 kyc_reminder: (p) => tplSellerApplicationReceived({ sellerName: p?.seller_name }),
 policy_violation_notice: (p) => tplAccountSuspension({ name: p?.seller_name, reason: p?.violation }),
};

// ─── API Routes ────────────────────────────────────────────────────────────────

// Send email
router.post("/notifications/email/send", async (req, res) => {
 try {
 const { to, subject, html, text, template, params } = req.body;
 if (!to || !subject) return res.status(400).json({ error: "to and subject are required" });
 const transporter = createTransporter();
 let emailHtml = html;
 if (!emailHtml && template && EMAIL_TEMPLATES[template]) {
 emailHtml = EMAIL_TEMPLATES[template](params || {});
 }
 const info = await transporter.sendMail({
 from: `"${process.env.ZOHO_FROM_NAME || "Kalavritti"}" <${process.env.ZOHO_FROM_EMAIL || "namaste@kalavritti.in"}>`,
 to, subject, html: emailHtml, text,
 });
 res.json({ success: true, messageId: info.messageId });
 } catch (err: any) {
 res.status(500).json({ error: err.message });
 }
});

// Test email
router.post("/notifications/email/test", async (req, res) => {
 try {
 const transporter = createTransporter();
 const html = tplOtpVerification({ name: "Admin", otp: "KALAVRITTI-TEST", purpose: "Email Connectivity Test" });
 await transporter.sendMail({
 from: `"Kalavritti" <${process.env.ZOHO_FROM_EMAIL || "namaste@kalavritti.in"}>`,
 to: req.body.to || process.env.ZOHO_FROM_EMAIL || "namaste@kalavritti.in",
 subject: " Kalavritti Email Test — Zoho SMTP Working",
 html,
 });
 res.json({ success: true, message: "Test email sent to " + (req.body.to || process.env.ZOHO_FROM_EMAIL) });
 } catch (err: any) {
 res.status(500).json({ error: err.message });
 }
});

// Order confirmed email
router.post("/notifications/email/order-confirmed", async (req, res) => {
 try {
 const { customerEmail, ...rest } = req.body;
 const transporter = createTransporter();
 await transporter.sendMail({
 from: `"Kalavritti" <${process.env.ZOHO_FROM_EMAIL}>`,
 to: customerEmail,
 subject: `Order Confirmed #${rest.orderId} — Kalavritti`,
 html: tplOrderConfirmed(rest),
 });
 res.json({ success: true });
 } catch (err: any) {
 res.status(500).json({ error: err.message });
 }
});

// ─── Universal generic template preview (covers all 200 templates) ───────────
function tplGenericPreview(templateName: string): string {
 // Determine category + theme from template name
 const n = templateName.toLowerCase();
 type Theme = { hdr: string; accent: string; badge: string; badgeTxt: string; icon: string; categoryLabel: string; };
 let theme: Theme = { hdr: "#7c2d12", accent: "#d97706", badge: "#fef9f0", badgeTxt: "#92400e", icon: "", categoryLabel: "General" };
 if (/otp|verify|password|login|2fa|security|lock|device|suspicious|account/.test(n))
 theme = { hdr: "#1e40af", accent: "#3b82f6", badge: "#eff6ff", badgeTxt: "#1e40af", icon: "", categoryLabel: "Authentication & Account" };
 else if (/order|ship|deliver|pickup|pack|dispatch|track|out_for/.test(n))
 theme = { hdr: "#166534", accent: "#16a34a", badge: "#f0fdf4", badgeTxt: "#166534", icon: "", categoryLabel: "Orders" };
 else if (/payment|invoice|receipt|refund|wallet|cod|chargeback|billing|tax|settlement|subscription/.test(n))
 theme = { hdr: "#065f46", accent: "#10b981", badge: "#ecfdf5", badgeTxt: "#065f46", icon: "", categoryLabel: "Payments & Billing" };
 else if (/return|exchange|store_credit|return_refund|return_delay|return_escal/.test(n))
 theme = { hdr: "#92400e", accent: "#d97706", badge: "#fffbeb", badgeTxt: "#92400e", icon: "", categoryLabel: "Returns & Exchanges" };
 else if (/flash_sale|festival|sale|newsletter|marketing|new_arriv|bestseller|coupon|loyalty|referral|birthday|anniversary|seasonal|free_ship|recommend|trending|reactivat|vip|last_chance|survey/.test(n))
 theme = { hdr: "#9f1239", accent: "#f43f5e", badge: "#fff1f2", badgeTxt: "#9f1239", icon: "", categoryLabel: "Marketing & Promotions" };
 else if (/cart|wishlist|checkout|review|rating|nps|feedback|saved/.test(n))
 theme = { hdr: "#4c1d95", accent: "#7c3aed", badge: "#f5f3ff", badgeTxt: "#4c1d95", icon: "", categoryLabel: "Cart, Wishlist & Reviews" };
 else if (/seller|kyc|store_creat|store_appro|store_reject|store_suspend|bank_verif|tax_detail|seller_prof|seller_perf|seller_welc/.test(n))
 theme = { hdr: "#7c2d12", accent: "#ea580c", badge: "#fff7ed", badgeTxt: "#9a3412", icon: "", categoryLabel: "Seller Management" };
 else if (/product|low_stock|out_of_stock|back_in_stock|featured|product_report/.test(n))
 theme = { hdr: "#155e75", accent: "#0891b2", badge: "#ecfeff", badgeTxt: "#155e75", icon: "", categoryLabel: "Products" };
 else if (/payout|commission|bonus|earning|settlement_gen|weekly_earn|monthly_earn/.test(n))
 theme = { hdr: "#312e81", accent: "#6366f1", badge: "#eef2ff", badgeTxt: "#312e81", icon: "", categoryLabel: "Payouts" };
 else if (/ticket|support|inquiry|negotiation|unread_msg|reply|new_message|customer_message/.test(n))
 theme = { hdr: "#1e3a5f", accent: "#3b82f6", badge: "#eff6ff", badgeTxt: "#1e3a5f", icon: "", categoryLabel: "Support & Messaging" };
 else if (/admin|daily_revenue|weekly_revenue|monthly_revenue|fraud|server_alert|backup|maintenance|terms_update|privacy_policy|kyc_reminder|policy_violation|suspension|reinstatement/.test(n))
 theme = { hdr: "#111827", accent: "#374151", badge: "#f3f4f6", badgeTxt: "#374151", icon: "", categoryLabel: "Admin & System" };

 // Prettify name
 const prettyName = templateName.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

 // Rich sample content based on category
 const contentMap: Record<string, string> = {
 "Authentication & Account": `
 <p class="greeting">Hello, Priya Sharma </p>
 <p class="text">We received a request related to your Kalavritti account. This email is to keep you informed about this activity.</p>
 <div class="otp-box"><p style="font-size:13px;color:#9ca3af;margin:0 0 8px">Your verification code</p><p class="otp-number">847291</p><p class="otp-note">Valid for 10 minutes · Do not share this code with anyone</p></div>
 <p class="text">If you did not initiate this action, please contact us immediately at <a href="mailto:namaste@kalavritti.in" style="color:#7c2d12">namaste@kalavritti.in</a></p>`,
 "Orders": `
 <p class="greeting">Your Order Update, Priya! </p>
 <p class="text">Great news! Here's the latest update on your Kalavritti order.</p>
 <div class="info-box"><strong>Order ID:</strong> KL-2025-0042<br/><strong>Status:</strong> <span style="color:#16a34a;font-weight:700">Confirmed</span><br/><strong>Estimated Delivery:</strong> 5–7 business days<br/><strong>Artisan:</strong> Meena Devi, West Bengal</div>
 <table class="items"><thead><tr><th>Product</th><th>Qty</th><th>Price</th></tr></thead><tbody>
 <tr><td>Dokra Brass Figurine</td><td>1</td><td>₹2,400</td></tr>
 <tr><td>Kantha Stitch Dupatta</td><td>1</td><td>₹1,100</td></tr>
 <tr class="total-row"><td colspan="2"><strong>Total</strong></td><td>₹3,500</td></tr>
 </tbody></table>
 <a href="https://kalavritti.in/account/orders" class="cta-btn">Track Your Order →</a>`,
 "Payments & Billing": `
 <p class="greeting">Payment Update, Priya! </p>
 <p class="text">Here is a summary of your recent payment activity on Kalavritti.</p>
 <div class="info-box"><strong>Transaction ID:</strong> TXN-9876543<br/><strong>Order:</strong> KL-2025-0042<br/><strong>Amount:</strong> ₹3,500<br/><strong>Date:</strong> ${new Date().toLocaleDateString("en-IN")}<br/><strong>Status:</strong> <span style="color:#16a34a;font-weight:700">Successful</span></div>
 <a href="https://kalavritti.in/account/orders" class="cta-btn">View Invoice →</a>`,
 "Returns & Exchanges": `
 <p class="greeting">Return Update, Priya </p>
 <p class="text">We have received your return/exchange request and are processing it with care.</p>
 <div class="info-box"><strong>Order ID:</strong> KL-2025-0042<br/><strong>Return ID:</strong> RET-2025-0018<br/><strong>Status:</strong> <span style="color:#d97706;font-weight:700">Processing</span><br/><strong>Refund Mode:</strong> Original Payment Method</div>
 <div class="alert-box alert-amber"><strong>Timeline:</strong> Refunds are processed within 5–7 business days after we receive your item. Our artisans' time and craftsmanship matter — we ensure fair resolutions for all parties.</div>`,
 "Marketing & Promotions": `
 <p class="greeting">Exclusive Offer for You, Priya! </p>
 <p class="text">Kalavritti brings you a special handpicked offer on authentic handmade products from Bengal &amp; Assam.</p>
 <div style="text-align:center;padding:24px 0"><div style="background:linear-gradient(135deg,#7c2d12,#9a3412);border-radius:16px;padding:24px;color:white"><p style="font-size:13px;opacity:0.85;margin:0 0 4px;letter-spacing:2px;text-transform:uppercase">Limited Time Offer</p><p style="font-size:40px;font-weight:900;margin:4px 0">25% OFF</p><p style="font-size:13px;opacity:0.85;margin:0">On all Terracotta &amp; Dokra craft — ends in 48 hours</p></div></div>
 <div style="text-align:center"><code style="background:#f9f5f0;border:2px dashed #d97706;color:#7c2d12;font-size:18px;font-weight:800;padding:10px 24px;border-radius:8px;display:inline-block;letter-spacing:4px">KALA25</code></div>
 <div style="text-align:center;margin-top:16px"><a href="https://kalavritti.in/categories" class="cta-btn">Shop Now →</a></div>`,
 "Cart, Wishlist & Reviews": `
 <p class="greeting">You left something behind, Priya! </p>
 <p class="text">Your cart is waiting with beautiful handmade treasures. Come back and complete your purchase before they're gone!</p>
 <div class="info-box"><strong>Items in Cart:</strong> 3<br/><strong>Cart Value:</strong> ₹4,200<br/><strong>Ships from:</strong> Kolkata, West Bengal</div>
 <div class="alert-box alert-amber">Each piece is handcrafted by skilled artisans — stock is limited. Don't miss out!</div>
 <a href="https://kalavritti.in/cart" class="cta-btn">Return to Cart →</a>`,
 "Seller Management": `
 <p class="greeting">Hello, Meena Devi </p>
 <p class="text">Here is an update regarding your seller account on Kalavritti — India's trusted marketplace for handmade crafts.</p>
 <div class="info-box"><strong>Seller:</strong> Meena Devi<br/><strong>Business:</strong> Meena's Terracotta Studio<br/><strong>Craft:</strong> Terracotta, West Bengal<br/><strong>Application ID:</strong> KLV-SEL-2025-0031<br/><strong>Status:</strong> <span style="color:#16a34a;font-weight:700">Under Review</span></div>
 <a href="https://kalavritti.in/seller-portal" class="cta-btn">View Seller Dashboard →</a>`,
 "Products": `
 <p class="greeting">Product Update, Meena! </p>
 <p class="text">Here's the latest status update for your product listing on Kalavritti.</p>
 <div class="info-box"><strong>Product:</strong> Dokra Brass Horse Figurine<br/><strong>SKU:</strong> KLV-TRC-0042<br/><strong>Stock:</strong> <span style="color:#d97706;font-weight:700">Low (3 remaining)</span><br/><strong>Status:</strong> Active &amp; Listed</div>
 <div class="alert-box alert-amber">Please restock soon to avoid losing potential buyers. Update your inventory from the Seller Dashboard.</div>`,
 "Payouts": `
 <p class="greeting">Payout Update, Meena! </p>
 <p class="text">Your earnings from Kalavritti have been processed. Here are the details.</p>
 <div class="stat-row"><div class="stat-box"><div class="stat-value">₹18,500</div><div class="stat-label">Payout Amount</div></div><div class="stat-box"><div class="stat-value">14</div><div class="stat-label">Orders</div></div><div class="stat-box"><div class="stat-value">June 2025</div><div class="stat-label">Period</div></div></div>
 <div class="info-box"><strong>Reference:</strong> PAY-20250601-0018<br/><strong>Bank:</strong> SBI ****4321<br/><strong>Expected:</strong> 1–2 business days</div>`,
 "Support & Messaging": `
 <p class="greeting">We're here to help, Priya! </p>
 <p class="text">Your support request has been received and our team is actively working on it.</p>
 <div class="info-box"><strong>Ticket ID:</strong> TKT-2025-0089<br/><strong>Subject:</strong> Order delivery query<br/><strong>Priority:</strong> Normal<br/><strong>Status:</strong> <span style="color:#2563eb;font-weight:700">In Progress</span></div>
 <p class="text">Our average response time is 4–6 hours during business hours (Mon–Sat, 9am–6pm IST).</p>
 <a href="mailto:namaste@kalavritti.in" class="cta-btn">Reply to This Ticket →</a>`,
 "Admin & System": `
 <p class="greeting">Admin Alert </p>
 <p class="text">This is an automated notification from the Kalavritti system. Please review the details below.</p>
 <div class="alert-box alert-amber"><strong>Alert Type:</strong> System Notification<br/><strong>Date:</strong> ${new Date().toLocaleDateString("en-IN")}<br/><strong>Time:</strong> ${new Date().toLocaleTimeString("en-IN")}</div>
 <div class="stat-row"><div class="stat-box"><div class="stat-value">₹42,500</div><div class="stat-label">Revenue Today</div></div><div class="stat-box"><div class="stat-value">18</div><div class="stat-label">Orders</div></div><div class="stat-box"><div class="stat-value">3</div><div class="stat-label">New Users</div></div></div>`,
 "General": `
 <p class="greeting">Hello from Kalavritti! </p>
 <p class="text">This is a notification from Kalavritti — India's trusted marketplace for authentic handmade products from Bengal and Assam.</p>
 <div class="info-box">Thank you for being part of the Kalavritti community. This message was sent to keep you informed about your account and activities.</div>
 <a href="https://kalavritti.in" class="cta-btn">Visit Kalavritti →</a>`,
 };

 const bodyContent = contentMap[theme.categoryLabel] || contentMap["General"];

 return emailBase(`
 <div class="section-label" style="color:${theme.accent}">${theme.categoryLabel}</div>
 ${bodyContent}
 <div class="divider"></div>
 <div style="background:${theme.badge};border:1px solid ${theme.accent}33;border-radius:10px;padding:14px 18px;margin-top:16px">
 <p style="font-size:11px;font-weight:700;color:${theme.accent};margin:0 0 8px;text-transform:uppercase;letter-spacing:1px">Template Info</p>
 <p style="font-size:12px;color:#6b7280;margin:0"><strong style="color:#374151">Template ID:</strong> <code style="background:white;padding:2px 6px;border-radius:4px;font-size:11px">${templateName}</code></p>
 <p style="font-size:11px;color:#9ca3af;margin:6px 0 0">This is a preview with sample data. Real emails will use dynamic values.</p>
 </div>
 `, `Preview: ${prettyName}`);
}

// Email template preview — covers ALL 200 templates
router.get("/notifications/email/preview/:template", (req, res) => {
 const name = req.params.template;
 const sampleParams: Record<string, any> = {
 customerName: "Priya Sharma", orderId: "KL-2025-0042", otp: "847291",
 sellerName: "Meena Devi", businessName: "Meena's Terracotta Studio",
 amount: 3500, refundAmount: 1200, transactionId: "TXN-9876543",
 date: new Date().toLocaleDateString("en-IN"), totalRevenue: 42500,
 totalOrders: 18, newCustomers: 3, name: "Admin",
 email: "admin@kalavritti.in", ip: "192.168.x.x",
 time: new Date().toLocaleString("en-IN"),
 title: "Weekend Flash Sale", discount: "25", endsIn: "48 hours",
 collectionName: "Monsoon Terracotta Collection", artisanName: "Rina Borah",
 message: "I'd like to know about bulk orders for corporate gifting.",
 resetLink: "https://kalavritti.in/reset-password?token=sample",
 period: "June 2025",
 };
 res.setHeader("Content-Type", "text/html");
 // Use specific template if registered, otherwise generate a rich branded preview
 const fn = EMAIL_TEMPLATES[name];
 res.send(fn ? fn(sampleParams) : tplGenericPreview(name));
});

// WhatsApp OTP
router.post("/notifications/whatsapp/send-otp", async (req, res) => {
 try {
 const { phone, otp } = req.body;
 if (!phone || !otp) return res.status(400).json({ error: "phone and otp required" });
 const cleanPhone = phone.replace(/\D/g, "");
 const e164 = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
 const result = await sendWhatsApp(e164, process.env.MSG91_OTP_TEMPLATE || "verify_code", [String(otp)]);
 res.json({ success: result.ok, raw: result.body });
 } catch (err: any) {
 res.status(500).json({ error: err.message });
 }
});

// WhatsApp order update
router.post("/notifications/whatsapp/order-update", async (req, res) => {
 try {
 const { phone, event, orderId, customerName, trackingNumber } = req.body;
 const templateMap: Record<string, string> = {
 confirmed: "order_confirmed",
 shipped: "order_shipped",
 delivered: "order_delivered",
 };
 const templateName = templateMap[event] || "order_confirmed";
 const cleanPhone = phone.replace(/\D/g, "");
 const e164 = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
 const bodyParams = [customerName || "Customer", orderId || "", trackingNumber || ""].filter(Boolean);
 const result = await sendWhatsApp(e164, templateName, bodyParams);
 res.json({ success: result.ok, raw: result.body });
 } catch (err: any) {
 res.status(500).json({ error: err.message });
 }
});

// Broadcast
router.post("/notifications/broadcast", async (req, res) => {
 try {
 const { recipients, subject, templateName, params, channel } = req.body;
 if (!recipients || !Array.isArray(recipients)) return res.status(400).json({ error: "recipients array required" });
 if (channel === "email" || channel === "email_whatsapp") {
 const transporter = createTransporter();
 let sent = 0;
 for (const recipient of recipients.slice(0, 100)) {
 try {
 const html = templateName && EMAIL_TEMPLATES[templateName]
 ? EMAIL_TEMPLATES[templateName]({ ...params, customerName: recipient.name, email: recipient.email })
 : `<p>${subject}</p>`;
 await transporter.sendMail({
 from: `"Kalavritti" <${process.env.ZOHO_FROM_EMAIL}>`,
 to: recipient.email, subject, html,
 });
 sent++;
 } catch { }
 }
 return res.json({ success: true, sent });
 }
 res.json({ success: true, queued: recipients.length });
 } catch (err: any) {
 res.status(500).json({ error: err.message });
 }
});

export default router;
