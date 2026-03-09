const User = require("../models/User");
const sendEmail = require("./sendEmail");
const Skill = require("../models/Skill");
const Match = require("../models/Match");
const Review = require("../models/Review");

const INACTIVE_REMINDER_DAY = 10;
const INACTIVE_DELETE_DAY = 15;

async function checkInactiveUsers() {
  try {
    const users = await User.find({ role: "user" });
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const user of users) {
      const lastActivity = user.lastLogin || user.createdAt;
      const lastActivityDate = new Date(lastActivity);
      lastActivityDate.setHours(0, 0, 0, 0);

      const daysSinceActivity = Math.floor(
        (today - lastActivityDate) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceActivity >= INACTIVE_DELETE_DAY) {
        await deleteInactiveUser(user);
      } else if (daysSinceActivity >= INACTIVE_REMINDER_DAY && !user.reminderSent) {
        await sendReminderEmail(user, daysSinceActivity);
      }
    }

    console.log("Inactive user check completed");
  } catch (error) {
    console.error("Error checking inactive users:", error);
  }
}

async function sendReminderEmail(user, daysInactive) {
  const daysLeft = INACTIVE_DELETE_DAY - daysInactive;

  const message = `Hi ${user.name},

We noticed you haven't logged in to SkillBarter for a while.

Your account will be deleted in ${daysLeft} day(s) if you don't log in.

To keep your account active, simply log in to SkillBarter.

If you have any questions, please contact us.

Best regards,
SkillBarter Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <div style="text-align: center; background: #4F46E5; padding: 20px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">SkillBarter</h1>
      </div>
      <div style="padding: 20px;">
        <h2 style="color: #333;">Hi ${user.name},</h2>
        <p style="color: #666; font-size: 16px;">We noticed you haven't logged in to SkillBarter for a while.</p>
        <div style="background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;">
          <p style="color: #92400E; font-size: 16px; margin: 0;">
            <strong>Your account will be deleted in ${daysLeft} day(s) if you don't log in.</strong>
          </p>
        </div>
        <p style="color: #666; font-size: 16px;">To keep your account active, simply log in to SkillBarter.</p>
        <p style="color: #666; font-size: 16px;">If you have any questions, please contact us.</p>
      </div>
      <div style="text-align: center; padding: 15px; background: #f9fafb; border-radius: 0 0 10px 10px;">
        <p style="color: #999; font-size: 12px; margin: 0;">Best regards,</p>
        <p style="color: #4F46E5; font-size: 14px; font-weight: bold; margin: 5px 0 0 0;">SkillBarter Team</p>
      </div>
    </div>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: "SkillBarter: Your account will be deleted soon!",
      message,
      html,
    });

    user.reminderSent = true;
    await user.save({ validateBeforeSave: false });
    console.log(`Reminder email sent to user: ${user.email}`);
  } catch (error) {
    console.error(`Failed to send reminder email to ${user.email}:`, error);
  }
}

async function sendDeletionNotificationEmail(user) {
  const message = `Hi ${user.name},

Your SkillBarter account has been deleted due to inactivity.

You haven't logged in for more than 15 days, so your account has been automatically removed from our system.

If you'd like to join SkillBarter again, you can create a new account anytime.

Best regards,
SkillBarter Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <div style="text-align: center; background: #DC2626; padding: 20px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">SkillBarter</h1>
      </div>
      <div style="padding: 20px;">
        <h2 style="color: #333;">Hi ${user.name},</h2>
        <p style="color: #666; font-size: 16px;">Your SkillBarter account has been deleted due to inactivity.</p>
        <div style="background: #FEE2E2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #DC2626;">
          <p style="color: #991B1B; font-size: 16px; margin: 0;">
            <strong>You haven't logged in for more than 15 days, so your account has been automatically removed from our system.</strong>
          </p>
        </div>
        <p style="color: #666; font-size: 16px;">If you'd like to join SkillBarter again, you can create a new account anytime.</p>
      </div>
      <div style="text-align: center; padding: 15px; background: #f9fafb; border-radius: 0 0 10px 10px;">
        <p style="color: #999; font-size: 12px; margin: 0;">Best regards,</p>
        <p style="color: #4F46E5; font-size: 14px; font-weight: bold; margin: 5px 0 0 0;">SkillBarter Team</p>
      </div>
    </div>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: "SkillBarter: Your account has been deleted",
      message,
      html,
    });
    console.log(`Deletion notification email sent to: ${user.email}`);
  } catch (error) {
    console.error(`Failed to send deletion notification to ${user.email}:`, error);
  }
}

async function deleteInactiveUser(user) {
  try {
    await sendDeletionNotificationEmail(user);

    await Promise.all([
      Skill.deleteMany({ user: user._id }),
      Match.deleteMany({
        $or: [{ requester: user._id }, { receiver: user._id }],
      }),
      Review.deleteMany({
        $or: [{ reviewer: user._id }, { reviewee: user._id }],
      }),
    ]);

    await user.deleteOne();
    console.log(`Inactive user deleted: ${user.email}`);
  } catch (error) {
    console.error(`Failed to delete inactive user ${user.email}:`, error);
  }
}

async function deleteAllInactiveUsers() {
  const deletedUsers = [];
  const users = await User.find({ role: "user" });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const user of users) {
    const lastActivity = user.lastLogin || user.createdAt;
    const lastActivityDate = new Date(lastActivity);
    lastActivityDate.setHours(0, 0, 0, 0);

    const daysSinceActivity = Math.floor(
      (today - lastActivityDate) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceActivity >= INACTIVE_DELETE_DAY) {
      await sendDeletionNotificationEmail(user);

      await Promise.all([
        Skill.deleteMany({ user: user._id }),
        Match.deleteMany({
          $or: [{ requester: user._id }, { receiver: user._id }],
        }),
        Review.deleteMany({
          $or: [{ reviewer: user._id }, { reviewee: user._id }],
        }),
      ]);

      await user.deleteOne();
      deletedUsers.push(user.email);
    }
  }

  return deletedUsers;
}

module.exports = {
  checkInactiveUsers,
  deleteAllInactiveUsers,
  INACTIVE_REMINDER_DAY,
  INACTIVE_DELETE_DAY,
};
