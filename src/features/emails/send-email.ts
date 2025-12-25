import { resendClient } from '@/libs/resend/resend-client';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  contestId?: string;
  squareId?: string;
  emailType: string;
}

export async function sendEmail({ to, subject, html, contestId, squareId, emailType }: SendEmailParams) {
  try {
    const { data, error } = await resendClient.emails.send({
      from: 'Griddo <onboarding@resend.dev>', // Update with your verified domain before production
      to,
      subject,
      html,
    });

    if (error) {
      throw new Error(error.message);
    }

    // Log email to database (optional, for tracking)
    // await logEmail({ contestId, squareId, recipientEmail: to, emailType, resendId: data?.id });

    return { success: true, id: data?.id };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}

