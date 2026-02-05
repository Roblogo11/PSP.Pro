// Email templates for booking notifications

interface BookingEmailData {
  athleteName: string
  athleteEmail: string
  serviceName: string
  date: string
  startTime: string
  endTime: string
  coachName: string
  location: string
  amount: string
  confirmationId: string
}

export function getBookingConfirmationEmail(data: BookingEmailData) {
  return {
    subject: `Booking Confirmed: ${data.serviceName} on ${data.date}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #004663 0%, #0088AB 100%); color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 40px auto; background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); border-radius: 16px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.1);">
    <!-- Header -->
    <tr>
      <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, rgba(0, 180, 216, 0.2) 0%, rgba(255, 75, 43, 0.1) 100%);">
        <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: #ffffff;">PSP.Pro</h1>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.7); letter-spacing: 0.2em; text-transform: uppercase;">Athletic OS</p>
      </td>
    </tr>

    <!-- Success Icon -->
    <tr>
      <td style="padding: 30px 30px 20px; text-align: center;">
        <div style="display: inline-block; width: 80px; height: 80px; background: rgba(34, 197, 94, 0.2); border-radius: 50%; position: relative;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h2 style="margin: 20px 0 0; font-size: 28px; font-weight: bold; color: #ffffff;">Booking Confirmed!</h2>
        <p style="margin: 8px 0 0; font-size: 16px; color: rgba(255, 255, 255, 0.7);">Your training session has been successfully booked</p>
      </td>
    </tr>

    <!-- Booking Details -->
    <tr>
      <td style="padding: 20px 30px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.1);">
          <tr>
            <td style="padding: 20px;">
              <table width="100%" cellpadding="12" cellspacing="0">
                <tr>
                  <td style="color: rgba(255, 255, 255, 0.6); font-size: 14px; padding: 8px 0;">Service</td>
                  <td style="color: #ffffff; font-weight: 600; font-size: 16px; text-align: right; padding: 8px 0;">${data.serviceName}</td>
                </tr>
                <tr>
                  <td style="color: rgba(255, 255, 255, 0.6); font-size: 14px; padding: 8px 0; border-top: 1px solid rgba(255, 255, 255, 0.1);">Date</td>
                  <td style="color: #ffffff; font-weight: 600; font-size: 16px; text-align: right; padding: 8px 0; border-top: 1px solid rgba(255, 255, 255, 0.1);">${data.date}</td>
                </tr>
                <tr>
                  <td style="color: rgba(255, 255, 255, 0.6); font-size: 14px; padding: 8px 0; border-top: 1px solid rgba(255, 255, 255, 0.1);">Time</td>
                  <td style="color: #ffffff; font-weight: 600; font-size: 16px; text-align: right; padding: 8px 0; border-top: 1px solid rgba(255, 255, 255, 0.1);">${data.startTime} - ${data.endTime}</td>
                </tr>
                <tr>
                  <td style="color: rgba(255, 255, 255, 0.6); font-size: 14px; padding: 8px 0; border-top: 1px solid rgba(255, 255, 255, 0.1);">Coach</td>
                  <td style="color: #ffffff; font-weight: 600; font-size: 16px; text-align: right; padding: 8px 0; border-top: 1px solid rgba(255, 255, 255, 0.1);">${data.coachName}</td>
                </tr>
                <tr>
                  <td style="color: rgba(255, 255, 255, 0.6); font-size: 14px; padding: 8px 0; border-top: 1px solid rgba(255, 255, 255, 0.1);">Location</td>
                  <td style="color: #ffffff; font-weight: 600; font-size: 16px; text-align: right; padding: 8px 0; border-top: 1px solid rgba(255, 255, 255, 0.1);">${data.location}</td>
                </tr>
                <tr>
                  <td style="color: rgba(255, 75, 43, 0.8); font-size: 14px; padding: 8px 0; border-top: 2px solid rgba(255, 75, 43, 0.3);">Total Paid</td>
                  <td style="color: #ffffff; font-weight: bold; font-size: 20px; text-align: right; padding: 8px 0; border-top: 2px solid rgba(255, 75, 43, 0.3);">$${data.amount}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- What's Next -->
    <tr>
      <td style="padding: 20px 30px;">
        <h3 style="margin: 0 0 16px; font-size: 20px; color: #ffffff;">What happens next?</h3>
        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 16px; margin-bottom: 12px; border: 1px solid rgba(255, 255, 255, 0.1);">
          <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.9);"><strong style="color: #ffffff;">📧 Confirmation Saved:</strong> This booking has been added to your account. You can view it anytime in your dashboard.</p>
        </div>
        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 16px; margin-bottom: 12px; border: 1px solid rgba(255, 255, 255, 0.1);">
          <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.9);"><strong style="color: #ffffff;">📅 Add to Calendar:</strong> Save this session to your personal calendar to receive reminders.</p>
        </div>
        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 16px; border: 1px solid rgba(255, 255, 255, 0.1);">
          <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.9);"><strong style="color: #ffffff;">🎯 Prepare:</strong> Arrive 10 minutes early with your training gear and a positive attitude!</p>
        </div>
      </td>
    </tr>

    <!-- CTA Button -->
    <tr>
      <td style="padding: 20px 30px; text-align: center;">
        <a href="https://psp.pro/locker" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #FF4B2B 0%, #FF7F50 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 20px rgba(255, 75, 43, 0.3);">View in Dashboard</a>
      </td>
    </tr>

    <!-- Confirmation ID -->
    <tr>
      <td style="padding: 20px 30px 30px; text-align: center;">
        <p style="margin: 0; font-size: 12px; color: rgba(255, 255, 255, 0.5);">
          Confirmation ID: <span style="font-family: monospace; color: rgba(255, 255, 255, 0.7);">${data.confirmationId}</span>
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 30px; text-align: center; background: rgba(0, 0, 0, 0.3); border-top: 1px solid rgba(255, 255, 255, 0.1);">
        <p style="margin: 0 0 8px; font-size: 14px; color: rgba(255, 255, 255, 0.7);">Need to make changes?</p>
        <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.5);">
          Contact us at <a href="mailto:support@psp.pro" style="color: #00B4D8; text-decoration: none;">support@psp.pro</a>
        </p>
        <p style="margin: 16px 0 0; font-size: 12px; color: rgba(255, 255, 255, 0.4);">
          © ${new Date().getFullYear()} Proper Sports Performance<br/>
          Virginia Beach, VA
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `
Booking Confirmed!

Hi ${data.athleteName},

Your training session has been successfully booked and paid for.

Booking Details:
- Service: ${data.serviceName}
- Date: ${data.date}
- Time: ${data.startTime} - ${data.endTime}
- Coach: ${data.coachName}
- Location: ${data.location}
- Total Paid: $${data.amount}

What happens next?
1. This booking has been added to your account
2. Add this session to your calendar
3. Arrive 10 minutes early with your training gear

Confirmation ID: ${data.confirmationId}

View in Dashboard: https://psp.pro/locker

Need help? Contact us at support@psp.pro

© ${new Date().getFullYear()} Proper Sports Performance
Virginia Beach, VA
    `.trim(),
  }
}

export function getBookingCancellationEmail(data: BookingEmailData) {
  return {
    subject: `Booking Cancelled: ${data.serviceName} on ${data.date}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Booking Cancelled</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #004663 0%, #0088AB 100%); color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 40px auto; background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); border-radius: 16px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.1);">
    <tr>
      <td style="padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: #ffffff;">PSP.Pro</h1>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.7);">Athletic OS</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px; text-align: center;">
        <h2 style="margin: 0 0 16px; font-size: 24px; color: #ffffff;">Booking Cancelled</h2>
        <p style="margin: 0; font-size: 16px; color: rgba(255, 255, 255, 0.7);">Your session for ${data.date} has been cancelled.</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px 30px; text-align: center;">
        <a href="https://psp.pro/booking" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #FF4B2B 0%, #FF7F50 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600;">Book Another Session</a>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px; text-align: center; background: rgba(0, 0, 0, 0.3);">
        <p style="margin: 0; font-size: 12px; color: rgba(255, 255, 255, 0.5);">
          © ${new Date().getFullYear()} Proper Sports Performance
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `
Booking Cancelled

Hi ${data.athleteName},

Your training session for ${data.date} has been cancelled.

Cancelled Session:
- Service: ${data.serviceName}
- Date: ${data.date}
- Time: ${data.startTime} - ${data.endTime}

Book another session: https://psp.pro/booking

© ${new Date().getFullYear()} Proper Sports Performance
    `.trim(),
  }
}
