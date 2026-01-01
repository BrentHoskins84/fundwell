import { ctaButton, squareDetailsTable } from '../components/email-components';
import { emailLayout, emailStyles } from '../layouts/email-layout';

interface PaymentConfirmedEmailParams {
  participantName: string;
  contestName: string;
  rowTeamName: string;
  colTeamName: string;
  rowIndex: number;
  colIndex: number;
  contestUrl: string;
}

export function paymentConfirmedEmail({
  participantName,
  contestName,
  rowTeamName,
  colTeamName,
  rowIndex,
  colIndex,
  contestUrl,
}: PaymentConfirmedEmailParams): { subject: string; html: string } {
  const subject = `Payment confirmed for ${contestName}`;

  const statusHtml = `
    <td style="${emailStyles.detailLabel}">Status:</td>
    <td style="color: #22c55e; font-size: 16px; font-weight: bold; text-align: right;">✓ Paid</td>
  `;

  const content = `
    <p style="${emailStyles.greeting}">Hi ${participantName},</p>
    <p style="margin: 0 0 24px 0; color: #fafafa; font-size: 18px; font-weight: 600;">
      Your payment has been confirmed! ✓
    </p>
    ${squareDetailsTable({
      rowIndex,
      colIndex,
      rowTeamName,
      colTeamName,
      statusHtml,
    })}
    <p style="${emailStyles.greeting}">Your square is locked in. Good luck!</p>
    ${ctaButton('View Contest', contestUrl)}
  `;

  const html = emailLayout({ children: content });

  return { subject, html };
}
