const { sendEmail } = require("../utils/sendEmail");

exports.sendSessionReminder = async (user, session, type) => {
  const subject = `Upcoming SkillBarter Session Reminder - ${type}`;
  
  // Determine partner if user objects are populated
  const isHost = session.hostUser && session.hostUser._id && session.hostUser._id.toString() === user._id.toString();
  const partnerName = isHost 
    ? (session.participantUser ? session.participantUser.name : "your partner")
    : (session.hostUser ? session.hostUser.name : "your partner");

  const message = `Hello ${user.name},\n\nThis is a reminder for your upcoming session.\n\nSkill to Teach: ${session.skillTeach}\nSkill to Learn: ${session.skillLearn}\nTime: ${session.startTime}\nMeeting Link: ${session.meetingLink || "Not provided"}\n\nGet ready for your session!`;
  
  const meetingHref = session.meetingLink && session.meetingLink.startsWith("http") ? session.meetingLink : `https://${session.meetingLink}`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Session Reminder</title>
</head>
<body style="background-color: #f3f4f6; margin: 0; padding: 40px 20px; font-family: 'Inter', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); overflow: hidden;">
    
    <!-- Top Header -->
    <div style="background: linear-gradient(135deg, #10b981, #0d9488); padding: 40px 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">SkillBarter</h1>
      <p style="color: #d1fae5; margin: 10px 0 0; font-size: 16px; font-weight: 500;">Your session ${type.toLowerCase()}</p>
    </div>

    <!-- Content Body -->
    <div style="padding: 40px 30px;">
      <p style="margin: 0 0 20px 0; color: #111827; font-size: 18px; font-weight: 600;">Hello ${user.name},</p>
      <p style="margin: 0 0 30px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
        Get ready to exchange skills! You have a session starting soon with <strong>${partnerName}</strong>. Here are your session details:
      </p>

      <!-- Details Card -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 35px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
          <tr>
            <td style="padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;">
              <span style="font-size: 13px; text-transform: uppercase; font-weight: 700; color: #64748b;">You Teach</span><br/>
              <span style="font-size: 16px; font-weight: 600; color: #0f172a;">${isHost ? session.skillTeach : session.skillLearn}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 0; border-bottom: 1px solid #e2e8f0;">
              <span style="font-size: 13px; text-transform: uppercase; font-weight: 700; color: #64748b;">They Teach</span><br/>
              <span style="font-size: 16px; font-weight: 600; color: #0f172a;">${isHost ? session.skillLearn : session.skillTeach}</span>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 16px;">
              <span style="font-size: 13px; text-transform: uppercase; font-weight: 700; color: #64748b;">Start Time</span><br/>
              <span style="font-size: 16px; font-weight: 600; color: #0f172a;">${session.startTime}</span>
            </td>
          </tr>
        </table>
      </div>

      <!-- Action Button -->
      <div style="text-align: center; margin-bottom: 25px;">
        ${session.meetingLink ? `
          <a href="${meetingHref}" style="display: inline-block; background: linear-gradient(135deg, #10b981, #0d9488); color: #ffffff; font-size: 16px; font-weight: 700; text-decoration: none; padding: 16px 36px; border-radius: 12px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);">
            Join Video Call
          </a>
        ` : `
          <span style="display: inline-block; background-color: #f1f5f9; color: #64748b; font-size: 16px; font-weight: 600; padding: 16px 36px; border-radius: 12px; border: 1px solid #e2e8f0;">
            Meeting Link Not Provided
          </span>
        `}
      </div>

      <p style="margin: 0; color: #64748b; font-size: 14px; text-align: center;">
        Please join promptly to make the most out of your skill exchange session!
      </p>
    </div>
    
  </div>
</body>
</html>`;

  try {
    await sendEmail({
      email: user.email,
      subject,
      message,
      html
    });
    console.log(`Reminder email sent to ${user.email} for session ${session._id}`);
  } catch (error) {
    console.error(`Failed to send reminder email to ${user.email}:`, error.message);
  }
};
