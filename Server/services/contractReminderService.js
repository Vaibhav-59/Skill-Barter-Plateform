// /server/services/contractReminderService.js
const SkillContract = require("../models/SkillContract");
const User = require("../models/User");
const { sendEmail } = require("../utils/sendEmail");
const Notification = require("../models/Notification");

/**
 * Called by cron scheduler. Checks all scheduled contract sessions
 * and fires 1-hour / 10-minute reminders.
 */
exports.sendContractReminders = async (io) => {
  try {
    const now = new Date();

    const activeContracts = await SkillContract.find({ status: "active" })
      .populate("userA", "name email")
      .populate("userB", "name email");

    for (const contract of activeContracts) {
      for (const session of contract.sessions) {
        if (session.status !== "scheduled" || !session.date || !session.startTime) continue;

        // Build full Date of session start
        const [h, m] = session.startTime.split(":").map(Number);
        const sessionStart = new Date(session.date);
        sessionStart.setHours(h, m, 0, 0);

        const diffMs = sessionStart.getTime() - now.getTime();
        const diffMin = diffMs / 60000;

        const shouldSend1h = diffMin > 0 && diffMin <= 60 && !session.reminderSent1h;
        const shouldSend10m = diffMin > 0 && diffMin <= 10 && !session.reminderSent10m;

        if (!shouldSend1h && !shouldSend10m) continue;

        const type = shouldSend10m ? "10 minutes" : "1 hour";
        const users = [contract.userA, contract.userB];

        for (const user of users) {
          const partnerName = user._id.toString() === contract.userA._id.toString()
            ? contract.userB.name
            : contract.userA.name;

          // In-app notification
          const notif = await Notification.create({
            recipient: user._id,
            type: "reminder",
            content: `⏰ Reminder: Session #${session.sessionNumber} of your ${contract.skillTeach} ↔ ${contract.skillLearn} contract starts in ${type}!`,
            relatedId: contract._id,
            relatedModel: "Match",
          });

          if (io && io.sendNotificationToUser) {
            io.sendNotificationToUser(user._id.toString(), notif);
          }

          // Email reminder
          try {
            const meetingHref = session.meetingLink && session.meetingLink.startsWith("http")
              ? session.meetingLink
              : (session.meetingLink ? `https://${session.meetingLink}` : null);

            await sendEmail({
              email: user.email,
              subject: `⏰ SkillBarter – Session Reminder (${type} away)`,
              message: `Hello ${user.name}, your session #${session.sessionNumber} with ${partnerName} starts in ${type} at ${session.startTime}.`,
              html: buildReminderEmail(user.name, partnerName, session, contract, type, meetingHref),
            });
          } catch (emailErr) {
            console.error(`Contract reminder email failed for ${user.email}:`, emailErr.message);
          }
        }

        // Mark flags to avoid re-sending
        if (shouldSend10m) session.reminderSent10m = true;
        if (shouldSend1h) session.reminderSent1h = true;
      }

      await contract.save();
    }
  } catch (err) {
    console.error("sendContractReminders error:", err);
  }
};

function buildReminderEmail(userName, partnerName, session, contract, timeLeft, meetingHref) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Session Reminder</title></head>
<body style="background:#f3f4f6;margin:0;padding:40px 20px;font-family:Inter,Helvetica,Arial,sans-serif">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:24px;box-shadow:0 10px 25px rgba(0,0,0,0.07);overflow:hidden">
    <div style="background:linear-gradient(135deg,#10b981,#0d9488);padding:40px 30px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:26px;font-weight:800">SkillBarter</h1>
      <p style="color:#d1fae5;margin:8px 0 0;font-size:16px">Session starts in <strong>${timeLeft}</strong>!</p>
    </div>
    <div style="padding:40px 30px">
      <p style="color:#111827;font-size:17px;font-weight:600">Hello ${userName},</p>
      <p style="color:#4b5563;font-size:15px;line-height:1.6">
        You have an upcoming skill exchange session with <strong>${partnerName}</strong> in <strong>${timeLeft}</strong>.
      </p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:22px;margin:24px 0">
        <p style="margin:0 0 10px;font-size:13px;text-transform:uppercase;font-weight:700;color:#64748b">Session #${session.sessionNumber}</p>
        <p style="margin:0 0 6px;font-size:15px;font-weight:600;color:#0f172a">📚 ${contract.skillTeach} ↔ ${contract.skillLearn}</p>
        <p style="margin:0;font-size:14px;color:#475569">🕐 ${session.startTime} — ${session.endTime}</p>
      </div>
      ${meetingHref ? `
      <div style="text-align:center">
        <a href="${meetingHref}" style="display:inline-block;background:linear-gradient(135deg,#10b981,#0d9488);color:#fff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:12px;box-shadow:0 4px 14px rgba(16,185,129,0.3)">
          Join Video Call
        </a>
      </div>` : ""}
    </div>
  </div>
</body>
</html>`;
}
