import { Router } from "express";
import nodemailer from "nodemailer";
import https from "https";

const router = Router();

// Zoho SMTP transporter
function createTransporter() {
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

// MSG91 WhatsApp API helper
function sendWhatsApp(to: string, templateName: string, components: Record<string, string> = {}): Promise<{ ok: boolean; body: string }> {
  return new Promise((resolve) => {
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

// ─── Send email ───────────────────────────────────────────────────────────────
router.post("/api/notifications/email/send", async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;
    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({ error: "to, subject, and html/text are required" });
    }
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"${process.env.ZOHO_FROM_NAME || "Kalavritti"}" <${process.env.ZOHO_FROM_EMAIL || "namaste@kalavritti.in"}>`,
      to, subject, html, text,
    });
    res.json({ success: true, messageId: info.messageId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Send test email ──────────────────────────────────────────────────────────
router.post("/api/notifications/email/test", async (req, res) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Kalavritti" <${process.env.ZOHO_FROM_EMAIL || "namaste@kalavritti.in"}>`,
      to: req.body.to || process.env.ZOHO_FROM_EMAIL || "namaste@kalavritti.in",
      subject: "Kalavritti — Test Email",
      html: `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#fff;">
        <h2 style="color:#7c2d12;">✅ Test Email Working</h2>
        <p>This is a test email from your Kalavritti admin panel.</p>
        <p style="color:#888;font-size:12px;">Sent at: ${new Date().toLocaleString("en-IN")}</p>
      </div>`,
    });
    res.json({ success: true, message: "Test email sent to " + (req.body.to || process.env.ZOHO_FROM_EMAIL) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Send order confirmation email ────────────────────────────────────────────
router.post("/api/notifications/email/order-confirmed", async (req, res) => {
  try {
    const { customerEmail, customerName, orderId, items, total, address } = req.body;
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Kalavritti" <${process.env.ZOHO_FROM_EMAIL}>`,
      to: customerEmail,
      subject: `Order Confirmed #${orderId} — Kalavritti`,
      html: orderConfirmedHtml({ customerName, orderId, items, total, address }),
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Send OTP via MSG91 WhatsApp ──────────────────────────────────────────────
router.post("/api/notifications/whatsapp/send-otp", async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ error: "phone and otp required" });
    const cleanPhone = phone.replace(/\D/g, "");
    const e164 = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
    const result = await sendWhatsApp(e164, process.env.MSG91_OTP_TEMPLATE || "verify_code", {
      body_1: otp,
    });
    res.json({ success: result.ok, raw: result.body });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Send order notification via WhatsApp ─────────────────────────────────────
router.post("/api/notifications/whatsapp/order-update", async (req, res) => {
  try {
    const { phone, event, orderId, customerName, trackingNumber } = req.body;
    // event: "confirmed" | "shipped" | "delivered"
    const templateMap: Record<string, string> = {
      confirmed: "order_confirmed",
      shipped: "order_shipped",
      delivered: "order_delivered",
    };
    const templateName = templateMap[event] || "order_confirmed";
    const cleanPhone = phone.replace(/\D/g, "");
    const e164 = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
    const result = await sendWhatsApp(e164, templateName, {
      body_1: customerName || "Customer",
      body_2: orderId || "",
      body_3: trackingNumber || "",
    });
    res.json({ success: result.ok, raw: result.body });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Broadcast notification ───────────────────────────────────────────────────
router.post("/api/notifications/broadcast", async (req, res) => {
  try {
    const { recipients, subject, html, channel } = req.body;
    if (!recipients || !Array.isArray(recipients)) return res.status(400).json({ error: "recipients array required" });
    if (channel === "email" || channel === "email_whatsapp") {
      const transporter = createTransporter();
      let sent = 0;
      for (const recipient of recipients.slice(0, 100)) {
        try {
          await transporter.sendMail({
            from: `"Kalavritti" <${process.env.ZOHO_FROM_EMAIL}>`,
            to: recipient.email,
            subject,
            html: html || `<p>${subject}</p>`,
          });
          sent++;
        } catch { /* continue */ }
      }
      return res.json({ success: true, sent });
    }
    res.json({ success: true, queued: recipients.length, note: "Broadcast queued for delivery" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── HTML Templates ───────────────────────────────────────────────────────────
function orderConfirmedHtml({ customerName, orderId, items = [], total, address = {} }: any) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
body{margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f5f0ea;}
.wrap{max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);}
.header{background:#7c2d12;padding:32px;text-align:center;color:#fff;}
.header h1{margin:0;font-size:22px;letter-spacing:0.5px;}
.header p{margin:8px 0 0;opacity:0.85;font-size:13px;}
.body{padding:32px;}
.badge{display:inline-block;background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;border-radius:20px;padding:6px 18px;font-size:13px;font-weight:600;margin-bottom:20px;}
.section-title{font-size:12px;font-weight:700;color:#9ca3af;letter-spacing:1px;text-transform:uppercase;margin:24px 0 12px;}
table.items{width:100%;border-collapse:collapse;}
table.items th{background:#f9f5f0;text-align:left;padding:10px 12px;font-size:12px;color:#6b7280;}
table.items td{padding:12px;border-bottom:1px solid #f3f4f6;font-size:14px;}
.total-row{font-weight:700;color:#7c2d12;font-size:16px;}
.address-box{background:#f9f5f0;border-radius:8px;padding:16px;font-size:13px;color:#374151;line-height:1.6;}
.footer{background:#1c0a00;color:#a1a1aa;text-align:center;padding:20px;font-size:11px;}
.footer a{color:#d97706;text-decoration:none;}
</style></head><body>
<div class="wrap">
  <div class="header">
    <h1>🏺 Kalavritti</h1>
    <p>Celebrating Handmade · Honouring Artisans</p>
  </div>
  <div class="body">
    <div class="badge">✅ Order Confirmed</div>
    <p style="font-size:16px;font-weight:600;color:#111827;">Namaste ${customerName || "Customer"} 🙏</p>
    <p style="color:#6b7280;font-size:14px;line-height:1.6;">Thank you for shopping with Kalavritti! Your order has been confirmed and the artisan has been notified. You'll receive a shipping update once your order is dispatched.</p>
    <p class="section-title">Order Details</p>
    <p style="font-size:13px;color:#6b7280;">Order ID: <strong style="color:#111827;">#${orderId}</strong></p>
    <table class="items">
      <thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead>
      <tbody>
        ${(items || []).map((it: any) => `<tr><td>${it.name}</td><td>${it.qty || 1}</td><td>₹${Number(it.price || 0).toLocaleString("en-IN")}</td></tr>`).join("") || `<tr><td colspan="3" style="color:#9ca3af;text-align:center;padding:20px;">Order items</td></tr>`}
        <tr class="total-row"><td colspan="2" style="padding:12px;text-align:right;">Total</td><td style="padding:12px;">₹${Number(total || 0).toLocaleString("en-IN")}</td></tr>
      </tbody>
    </table>
    <p class="section-title">Delivery Address</p>
    <div class="address-box">${address.name || ""}<br>${address.line1 || ""}${address.city ? `, ${address.city}` : ""}${address.state ? ` — ${address.state}` : ""}${address.pincode ? ` ${address.pincode}` : ""}</div>
    <p style="color:#9ca3af;font-size:12px;margin-top:24px;">Questions? Email us at <a href="mailto:namaste@kalavritti.in" style="color:#d97706;">namaste@kalavritti.in</a> or WhatsApp us at <a href="https://wa.me/919476211198" style="color:#d97706;">+91 94762 11198</a></p>
  </div>
  <div class="footer">
    <p>© ${new Date().getFullYear()} Kalavritti · Celebrating Handmade</p>
    <p><a href="https://kalavritti.in">kalavritti.in</a> · <a href="mailto:namaste@kalavritti.in">namaste@kalavritti.in</a></p>
    <p style="margin-top:8px;font-size:10px;">You received this because you placed an order on Kalavritti. <a href="#">Unsubscribe</a></p>
  </div>
</div>
</body></html>`;
}

export default router;
