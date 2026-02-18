// Email templates for booking notifications

// Shared email footer with CAN-SPAM required elements
function getEmailFooter(unsubscribeUrl?: string): string {
  const unsubRow = unsubscribeUrl
    ? `<tr><td style="padding: 8px 0 0; text-align: center;"><a href="${unsubscribeUrl}" style="font-size: 11px; color: rgba(255,255,255,0.3); text-decoration: underline;">Unsubscribe from emails</a></td></tr>`
    : ''
  return `
    <tr>
      <td style="padding: 30px; text-align: center; background: rgba(0, 0, 0, 0.3); border-top: 1px solid rgba(255, 255, 255, 0.1);">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="text-align: center;">
              <p style="margin: 0; font-size: 12px; color: rgba(255, 255, 255, 0.4);">
                © ${new Date().getFullYear()} Proper Sports Performance | Virginia Beach, VA
              </p>
              <p style="margin: 6px 0 0; font-size: 11px; color: rgba(255, 255, 255, 0.3);">
                <a href="mailto:support@propersports.pro" style="color: #00B4D8; text-decoration: none;">support@propersports.pro</a>
                &nbsp;·&nbsp;
                <a href="https://propersports.pro/privacy" style="color: rgba(255,255,255,0.3); text-decoration: none;">Privacy Policy</a>
              </p>
            </td>
          </tr>
          ${unsubRow}
        </table>
      </td>
    </tr>`
}

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
  unsubscribeUrl?: string
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
        <p style="margin: 8px 0 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.7); letter-spacing: 0.2em; text-transform: uppercase;">PSP.Pro</p>
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
        <a href="https://propersports.pro/locker" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #FF4B2B 0%, #FF7F50 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 20px rgba(255, 75, 43, 0.3);">View in Dashboard</a>
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

    <!-- Need help row -->
    <tr>
      <td style="padding: 0 30px 10px; text-align: center;">
        <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.5);">
          Need to make changes? <a href="mailto:support@propersports.pro" style="color: #00B4D8; text-decoration: none;">support@propersports.pro</a>
        </p>
      </td>
    </tr>
    ${getEmailFooter(data.unsubscribeUrl)}
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

View in Dashboard: https://propersports.pro/locker

Need help? Contact us at support@propersports.pro

© ${new Date().getFullYear()} Proper Sports Performance
Virginia Beach, VA
    `.trim(),
  }
}

export function getPayOnSiteBookingEmail(data: BookingEmailData) {
  return {
    subject: `Booking Submitted: ${data.serviceName} on ${data.date}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Submitted</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #004663 0%, #0088AB 100%); color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 40px auto; background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); border-radius: 16px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.1);">
    <tr>
      <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, rgba(0, 180, 216, 0.2) 0%, rgba(255, 75, 43, 0.1) 100%);">
        <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: #ffffff;">PSP.Pro</h1>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.7); letter-spacing: 0.2em; text-transform: uppercase;">Proper Sports Performance</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px 30px 20px; text-align: center;">
        <div style="display: inline-block; width: 80px; height: 80px; background: rgba(251, 191, 36, 0.2); border-radius: 50%; line-height: 80px; font-size: 40px; text-align: center;">⏳</div>
        <h2 style="margin: 20px 0 0; font-size: 28px; font-weight: bold; color: #ffffff;">Booking Submitted!</h2>
        <p style="margin: 8px 0 0; font-size: 16px; color: rgba(255, 255, 255, 0.7);">Your session is pending confirmation</p>
      </td>
    </tr>
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
                  <td style="color: rgba(251, 191, 36, 0.8); font-size: 14px; padding: 8px 0; border-top: 2px solid rgba(251, 191, 36, 0.3);">Payment</td>
                  <td style="color: #fbbf24; font-weight: bold; font-size: 16px; text-align: right; padding: 8px 0; border-top: 2px solid rgba(251, 191, 36, 0.3);">$${data.amount} — Pay at Location</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px 30px;">
        <div style="background: rgba(251, 191, 36, 0.1); border-radius: 12px; padding: 16px; border: 1px solid rgba(251, 191, 36, 0.3);">
          <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.9);"><strong style="color: #fbbf24;">Reminder:</strong> Please bring cash or a card to pay at the start of your session.</p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px 30px; text-align: center;">
        <a href="https://propersports.pro/locker" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #FF4B2B 0%, #FF7F50 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">View in Dashboard</a>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 30px 10px; text-align: center;">
        <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.5);">
          Need to make changes? <a href="mailto:support@propersports.pro" style="color: #00B4D8; text-decoration: none;">support@propersports.pro</a>
        </p>
      </td>
    </tr>
    ${getEmailFooter(data.unsubscribeUrl)}
  </table>
</body>
</html>
    `,
    text: `
Booking Submitted!

Hi ${data.athleteName},

Your training session has been submitted and is pending confirmation.

Booking Details:
- Service: ${data.serviceName}
- Date: ${data.date}
- Time: ${data.startTime} - ${data.endTime}
- Coach: ${data.coachName}
- Location: ${data.location}
- Amount Due: $${data.amount} (pay at location)

Reminder: Please bring cash or a card to pay at the start of your session.

View in Dashboard: https://propersports.pro/locker

Need help? Contact us at support@propersports.pro

© ${new Date().getFullYear()} Proper Sports Performance
Virginia Beach, VA
    `.trim(),
  }
}

interface CoachNotificationData {
  coachName: string
  athleteName: string
  serviceName: string
  date: string
  startTime: string
  endTime: string
  location: string
  paymentMethod: string
}

export function getCoachNewBookingEmail(data: CoachNotificationData) {
  const paymentLabel = data.paymentMethod === 'on_site' ? 'Pay at Location' :
    data.paymentMethod === 'package' ? 'Package Session' :
    data.paymentMethod === 'comp' ? 'Complimentary' : 'Paid Online'

  return {
    subject: `New Booking: ${data.athleteName} — ${data.serviceName} on ${data.date}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Booking</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #004663 0%, #0088AB 100%); color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 40px auto; background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); border-radius: 16px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.1);">
    <tr>
      <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, rgba(0, 180, 216, 0.2) 0%, rgba(255, 75, 43, 0.1) 100%);">
        <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: #ffffff;">PSP.Pro</h1>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.7); letter-spacing: 0.2em; text-transform: uppercase;">Coach Notification</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px; text-align: center;">
        <h2 style="margin: 0 0 8px; font-size: 24px; color: #ffffff;">New Booking!</h2>
        <p style="margin: 0; font-size: 16px; color: rgba(255, 255, 255, 0.7);"><strong style="color: #22c55e;">${data.athleteName}</strong> booked a session with you</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 30px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1);">
          <tr><td style="padding: 20px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="color: rgba(255, 255, 255, 0.6); font-size: 14px; padding: 8px 0;">Athlete</td>
                <td style="color: #ffffff; font-weight: 600; text-align: right; padding: 8px 0;">${data.athleteName}</td>
              </tr>
              <tr>
                <td style="color: rgba(255, 255, 255, 0.6); font-size: 14px; padding: 8px 0; border-top: 1px solid rgba(255,255,255,0.1);">Service</td>
                <td style="color: #ffffff; font-weight: 600; text-align: right; padding: 8px 0; border-top: 1px solid rgba(255,255,255,0.1);">${data.serviceName}</td>
              </tr>
              <tr>
                <td style="color: rgba(255, 255, 255, 0.6); font-size: 14px; padding: 8px 0; border-top: 1px solid rgba(255,255,255,0.1);">Date</td>
                <td style="color: #ffffff; font-weight: 600; text-align: right; padding: 8px 0; border-top: 1px solid rgba(255,255,255,0.1);">${data.date}</td>
              </tr>
              <tr>
                <td style="color: rgba(255, 255, 255, 0.6); font-size: 14px; padding: 8px 0; border-top: 1px solid rgba(255,255,255,0.1);">Time</td>
                <td style="color: #ffffff; font-weight: 600; text-align: right; padding: 8px 0; border-top: 1px solid rgba(255,255,255,0.1);">${data.startTime} - ${data.endTime}</td>
              </tr>
              <tr>
                <td style="color: rgba(255, 255, 255, 0.6); font-size: 14px; padding: 8px 0; border-top: 1px solid rgba(255,255,255,0.1);">Location</td>
                <td style="color: #ffffff; font-weight: 600; text-align: right; padding: 8px 0; border-top: 1px solid rgba(255,255,255,0.1);">${data.location}</td>
              </tr>
              <tr>
                <td style="color: rgba(255, 255, 255, 0.6); font-size: 14px; padding: 8px 0; border-top: 1px solid rgba(255,255,255,0.1);">Payment</td>
                <td style="color: #fbbf24; font-weight: 600; text-align: right; padding: 8px 0; border-top: 1px solid rgba(255,255,255,0.1);">${paymentLabel}</td>
              </tr>
            </table>
          </td></tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px 30px; text-align: center;">
        <a href="https://propersports.pro/admin/bookings" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #FF4B2B 0%, #FF7F50 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600;">View Bookings</a>
      </td>
    </tr>
    ${getEmailFooter()}
  </table>
</body>
</html>
    `,
    text: `
New Booking!

Hi ${data.coachName},

${data.athleteName} has booked a session with you.

Details:
- Service: ${data.serviceName}
- Date: ${data.date}
- Time: ${data.startTime} - ${data.endTime}
- Location: ${data.location}
- Payment: ${paymentLabel}

View bookings: https://propersports.pro/admin/bookings

© ${new Date().getFullYear()} Proper Sports Performance
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
        <p style="margin: 8px 0 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.7);">PSP.Pro</p>
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
        <a href="https://propersports.pro/booking" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #FF4B2B 0%, #FF7F50 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600;">Book Another Session</a>
      </td>
    </tr>
    ${getEmailFooter(data.unsubscribeUrl)}
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

Book another session: https://propersports.pro/booking

© ${new Date().getFullYear()} Proper Sports Performance | Virginia Beach, VA
    `.trim(),
  }
}

// ── Parent/Guardian Notification (COPPA) ────────────────────
interface ParentNotificationData {
  parentName: string
  parentEmail: string
  athleteName: string
  athleteAge: number
}

export function getParentNotificationEmail(data: ParentNotificationData) {
  return {
    subject: `Your athlete joined PSP.Pro — important account notice`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Parent/Guardian Notification</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #004663 0%, #0088AB 100%); color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 40px auto; background: rgba(255, 255, 255, 0.05); border-radius: 16px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.1);">
    <!-- Header -->
    <tr>
      <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, rgba(0, 180, 216, 0.2) 0%, rgba(255, 75, 43, 0.1) 100%);">
        <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: #ffffff;">PSP.Pro</h1>
        <p style="margin: 8px 0 0; font-size: 14px; color: rgba(255,255,255,0.7); letter-spacing: 0.2em; text-transform: uppercase;">Parent/Guardian Notice</p>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding: 30px;">
        <h2 style="margin: 0 0 16px; font-size: 22px; color: #ffffff;">Hi ${data.parentName},</h2>
        <p style="margin: 0 0 16px; font-size: 15px; color: rgba(255,255,255,0.85); line-height: 1.6;">
          We're letting you know that <strong style="color:#ffffff;">${data.athleteName}</strong> (age ${data.athleteAge})
          recently created an account on <strong style="color:#00B4D8;">PSP.Pro</strong> —
          Proper Sports Performance's athlete training platform.
        </p>
        <p style="margin: 0 0 20px; font-size: 15px; color: rgba(255,255,255,0.85); line-height: 1.6;">
          As the parent or guardian you provided, we wanted to inform you of the account and the information collected.
        </p>

        <!-- What we collected -->
        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.1);">
          <h3 style="margin: 0 0 12px; font-size: 16px; color: #00B4D8;">Information collected at signup:</h3>
          <ul style="margin: 0; padding: 0 0 0 20px; color: rgba(255,255,255,0.8); font-size: 14px; line-height: 1.8;">
            <li>Name and email address</li>
            <li>Age (${data.athleteAge})</li>
            <li>Primary sport(s) selection</li>
            <li>Your name, email, and phone as parent/guardian</li>
          </ul>
          <p style="margin: 12px 0 0; font-size: 13px; color: rgba(255,255,255,0.5);">
            We do <strong>not</strong> sell personal data to third parties. Data is used solely to provide training services.
          </p>
        </div>

        <!-- Action info -->
        <div style="background: rgba(255,75,43,0.1); border-radius: 12px; padding: 16px; border: 1px solid rgba(255,75,43,0.3);">
          <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.9); line-height: 1.6;">
            <strong style="color:#FF4B2B;">If you did not authorize this account,</strong> or wish to have it removed,
            please contact us immediately at
            <a href="mailto:privacy@propersports.pro" style="color: #00B4D8; text-decoration: none;">privacy@propersports.pro</a>
            and we will delete the account and all associated data within 48 hours.
          </p>
        </div>
      </td>
    </tr>

    <!-- Links -->
    <tr>
      <td style="padding: 0 30px 20px; text-align: center;">
        <a href="https://propersports.pro/privacy" style="display: inline-block; padding: 12px 24px; background: rgba(0,180,216,0.2); color: #00B4D8; text-decoration: none; border-radius: 8px; font-size: 14px; border: 1px solid rgba(0,180,216,0.3);">View Privacy Policy</a>
      </td>
    </tr>

    ${getEmailFooter()}
  </table>
</body>
</html>
    `,
    text: `
Hi ${data.parentName},

This is a notification from PSP.Pro (Proper Sports Performance).

Your athlete, ${data.athleteName} (age ${data.athleteAge}), recently created an account on PSP.Pro — our athlete training platform. Your contact information was provided as their parent/guardian.

Information collected at signup:
- Name and email address
- Age (${data.athleteAge})
- Primary sport(s) selection
- Your name, email, and phone as parent/guardian

We do not sell personal data to third parties.

IF YOU DID NOT AUTHORIZE THIS ACCOUNT: Please contact us immediately at privacy@propersports.pro and we will delete the account and all data within 48 hours.

Privacy Policy: https://propersports.pro/privacy

© ${new Date().getFullYear()} Proper Sports Performance | Virginia Beach, VA
    `.trim(),
  }
}
