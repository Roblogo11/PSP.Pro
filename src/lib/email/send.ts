import { Resend } from 'resend'

interface SendEmailParams {
  to: string
  subject: string
  html: string
  text: string
}

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  if (!resend) {
    // Fallback for development — log instead of sending
    console.log('📧 Email would be sent (no RESEND_API_KEY):', {
      to,
      subject,
      preview: text.substring(0, 100) + '...',
    })
    return { success: true }
  }

  try {
    const { error } = await resend.emails.send({
      from: 'PSP.Pro <bookings@propersports.pro>',
      to,
      subject,
      html,
      text,
    })

    if (error) {
      console.error('Resend email error:', error)
      return { success: false, error }
    }

    return { success: true }
  } catch (err) {
    console.error('Email send failed:', err)
    return { success: false, error: err }
  }
}
