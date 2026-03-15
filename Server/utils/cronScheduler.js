const cron = require("node-cron");
const Session = require("../models/Session");
const { sendSessionReminder } = require("../services/reminderService");

const startCronJobs = (app) => {
  // Run every minute
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      const sessions = await Session.find({ status: "accepted" })
        .populate("hostUser")
        .populate("participantUser");

      const io = app.get("io");

      for (const session of sessions) {
        if (!session.date || !session.startTime) continue;

        // Parse session start time
        const sessionDateTime = new Date(session.date);
        const [startHour, startMinute] = session.startTime.split(":");
        sessionDateTime.setHours(parseInt(startHour, 10), parseInt(startMinute, 10), 0, 0);

        const diffMs = sessionDateTime.getTime() - now.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        // 1 Hour Reminder
        if (diffMins <= 60 && diffMins > 10 && !session.reminderSent) {
          if (session.hostUser) await sendSessionReminder(session.hostUser, session, "Starts in 1 Hour");
          if (session.participantUser) await sendSessionReminder(session.participantUser, session, "Starts in 1 Hour");

          if (io) {
            io.to(session.hostUser._id.toString()).emit("session-reminder", { session, type: "1 Hour" });
            io.to(session.participantUser._id.toString()).emit("session-reminder", { session, type: "1 Hour" });
          }

          session.reminderSent = true;
          await session.save();
        }

        // 10 Min Reminder
        if (diffMins <= 10 && diffMins >= 0 && !session.reminder10MinSent) {
          if (session.hostUser) await sendSessionReminder(session.hostUser, session, "Starts in 10 Minutes");
          if (session.participantUser) await sendSessionReminder(session.participantUser, session, "Starts in 10 Minutes");

          if (io) {
            io.to(session.hostUser._id.toString()).emit("session-reminder", { session, type: "10 Minutes" });
            io.to(session.participantUser._id.toString()).emit("session-reminder", { session, type: "10 Minutes" });
          }

          session.reminder10MinSent = true;
          await session.save();
        }
      }
    } catch (error) {
      console.error("Cron Job Error:", error);
    }
  });
};

module.exports = startCronJobs;
