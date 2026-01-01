import { ctaButton } from '../components/email-components';
import { emailLayout, emailStyles } from '../layouts/email-layout';

interface WinnerEmailParams {
  participantName: string;
  contestName: string;
  quarterName: string;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
  prizeAmount: number;
  contestUrl: string;
}

export function winnerEmail({
  participantName,
  contestName,
  quarterName,
  homeTeamName,
  awayTeamName,
  homeScore,
  awayScore,
  prizeAmount,
  contestUrl,
}: WinnerEmailParams): { subject: string; html: string } {
  const subject = `🏆 You won ${quarterName} in ${contestName}!`;

  const scoreBox = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${emailStyles.detailsBox}">
      <tr>
        <td style="${emailStyles.detailsBoxPadding}">
          <h3 style="margin: 0 0 16px 0; color: #a1a1aa; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; text-align: center;">
            Final Score
          </h3>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding: 12px 16px; background-color: #52525b; border-radius: 6px 6px 0 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="color: #fafafa; font-size: 16px; font-weight: 600;">${homeTeamName}</td>
                    <td style="color: #fafafa; font-size: 24px; font-weight: bold; text-align: right;">${homeScore}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 16px; background-color: #52525b; border-radius: 0 0 6px 6px; border-top: 1px solid #71717a;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="color: #fafafa; font-size: 16px; font-weight: 600;">${awayTeamName}</td>
                    <td style="color: #fafafa; font-size: 24px; font-weight: bold; text-align: right;">${awayScore}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  const prizeSection = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
      <tr>
        <td align="center">
          <p style="margin: 0 0 8px 0; color: #a1a1aa; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
            Your Prize
          </p>
          <p style="margin: 0; color: #22c55e; font-size: 48px; font-weight: bold;">
            $${prizeAmount.toLocaleString()}
          </p>
        </td>
      </tr>
    </table>
  `;

  const gradientCtaButton = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 8px 0;">
          <a href="${contestUrl}" style="display: inline-block; background: linear-gradient(135deg, #F97316 0%, #FBBF24 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 16px; font-weight: 600;">
            View Contest
          </a>
        </td>
      </tr>
    </table>
  `;

  const content = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding-bottom: 24px;">
          <div style="font-size: 64px; line-height: 1;">🏆</div>
          <h2 style="margin: 16px 0 0 0; color: #FBBF24; font-size: 32px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">
            WINNER!
          </h2>
        </td>
      </tr>
    </table>
    <p style="margin: 0 0 8px 0; color: #fafafa; font-size: 20px; text-align: center; font-weight: 600;">
      Congratulations ${participantName}!
    </p>
    <p style="margin: 0 0 24px 0; color: #a1a1aa; font-size: 16px; text-align: center;">
      You won <strong style="color: #F97316;">${quarterName}</strong> in <strong style="color: #fafafa;">${contestName}</strong>!
    </p>
    ${scoreBox}
    ${prizeSection}
    ${gradientCtaButton}
  `;

  const html = emailLayout({ headerStyle: 'gradient', children: content });

  return { subject, html };
}
