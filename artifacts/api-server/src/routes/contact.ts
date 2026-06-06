import { Router } from "express";
import { db } from "@workspace/db";
import { contactsTable, newsletterSubscribersTable } from "@workspace/db";

const router = Router();

router.post("/contact", async (req, res) => {
  try {
    const { fullName, email, phone, subject, message } = req.body;
    if (!fullName || !email || !subject || !message) {
      res.status(400).json({ error: "Missing required fields" }); return;
    }
    await db.insert(contactsTable).values({ fullName, email, phone, subject, message });
    res.json({ success: true, message: "Message sent successfully" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

router.post("/newsletter/subscribe", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) { res.status(400).json({ error: "Email required" }); return; }

    await db
      .insert(newsletterSubscribersTable)
      .values({ email })
      .onConflictDoNothing();

    res.json({ success: true, message: "Subscribed successfully" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to subscribe" });
  }
});

export default router;
