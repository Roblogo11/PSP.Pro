// Email sending utility
// This is a placeholder that demonstrates how to integrate with email services
// You can replace this with services like Resend, SendGrid, Postmark, etc.

interface SendEmailParams {
  to: string
  subject: string
  html: string
  text: string
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  // PLACEHOLDER: Replace with your email service
  // Example integrations:

  // Option 1: Resend (recommended for Next.js)
  // const { Resend } = require('resend')
  // const resend = new Resend(process.env.RESEND_API_KEY)
  // return await resend.emails.send({
  //   from: 'PSP.Pro <bookings@psp.pro>',
  //   to,
  //   subject,
  //   html,
  //   text,
  // })

  // Option 2: SendGrid
  // const sgMail = require('@sendgrid/mail')
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  // return await sgMail.send({
  //   to,
  //   from: 'bookings@psp.pro',
  //   subject,
  //   html,
  //   text,
  // })

  // Option 3: Postmark
  // const postmark = require('postmark')
  // const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY)
  // return await client.sendEmail({
  //   From: 'bookings@psp.pro',
  //   To: to,
  //   Subject: subject,
  //   HtmlBody: html,
  //   TextBody: text,
  // })

  // For development/testing - just log the email
  console.log('📧 Email would be sent:', {
    to,
    subject,
    preview: text.substring(0, 100) + '...',
  })

  return { success: true }
}
