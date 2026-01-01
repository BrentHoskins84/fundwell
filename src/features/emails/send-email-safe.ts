import { logger } from '@/utils/logger';

import { sendEmail } from './send-email';

interface SendEmailSafeParams {
  to: string;
  template: { subject: string; html: string };
  contestId: string;
  squareId?: string;
  emailType: string;
}

export async function sendEmailSafe(params: SendEmailSafeParams): Promise<boolean> {
  try {
    await sendEmail({
      to: params.to,
      subject: params.template.subject,
      html: params.template.html,
      contestId: params.contestId,
      squareId: params.squareId,
      emailType: params.emailType,
    });
    return true;
  } catch (error) {
    const { emailType } = params;
    logger.error('sendEmailSafe', error, { emailType, to: params.to, contestId: params.contestId });
    return false;
  }
}

