import { ctaButton, squareDetailsTable } from '../components/email-components';
import { emailLayout, emailStyles } from '../layouts/email-layout';

interface PaymentOption {
  type: string;
  handle: string;
  link?: string;
}

interface SquareClaimedEmailParams {
  participantName: string;
  contestName: string;
  rowTeamName: string;
  colTeamName: string;
  rowIndex: number;
  colIndex: number;
  squarePrice: number;
  contestUrl: string;
  paymentOptions: PaymentOption[];
}

export function squareClaimedEmail({
  participantName,
  contestName,
  rowTeamName,
  colTeamName,
  rowIndex,
  colIndex,
  squarePrice,
  contestUrl,
  paymentOptions,
}: SquareClaimedEmailParams): { subject: string; html: string } {
  const subject = `You claimed a square in ${contestName}!`;

  const paymentOptionsHtml = paymentOptions
    .map(
      (option) => `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #3f3f46;">
          <strong style="color: #fafafa;">${option.type}:</strong>
          ${
            option.link
              ? `<a href="${option.link}" style="color: #F97316; text-decoration: none; margin-left: 8px;">${option.handle}</a>`
              : `<span style="color: #a1a1aa; margin-left: 8px;">${option.handle}</span>`
          }
        </td>
      </tr>
    `
    )
    .join('');

  const statusHtml = `
    <td style="${emailStyles.detailLabel}">Amount Due:</td>
    <td style="color: #F97316; font-size: 16px; font-weight: bold; text-align: right;">$${squarePrice.toFixed(2)}</td>
  `;

  const paymentSection =
    paymentOptions.length > 0
      ? `
        <h3 style="margin: 0 0 16px 0; color: #fafafa; font-size: 16px; font-weight: 600;">
          Complete your payment using one of these options:
        </h3>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
          ${paymentOptionsHtml}
        </table>
      `
      : '';

  const content = `
    <p style="${emailStyles.greeting}">Hi ${participantName},</p>
    <p style="${emailStyles.greeting}">
      You've claimed a square in <strong style="color: #F97316;">${contestName}</strong>!
    </p>
    ${squareDetailsTable({
      rowIndex,
      colIndex,
      rowTeamName,
      colTeamName,
      statusHtml,
    })}
    ${paymentSection}
    ${ctaButton('View Contest', contestUrl)}
  `;

  const html = emailLayout({ children: content });

  return { subject, html };
}

