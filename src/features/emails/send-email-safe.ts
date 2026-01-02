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
    const result = await sendEmail({
      to: params.to,
      subject: params.template.subject,
      html: params.template.html,
      contestId: params.contestId,
      squareId: params.squareId,
      emailType: params.emailType,
    });

    if (!result.success) {
      logger.error('sendEmailSafe', result.error, {
        emailType: params.emailType,
        to: params.to,
        contestId: params.contestId,
      });
      return false;
    }

    return true;
  } catch (error) {
    logger.error('sendEmailSafe', error, {
      emailType: params.emailType,
      to: params.to,
      contestId: params.contestId,
    });
    return false;
  }
}

