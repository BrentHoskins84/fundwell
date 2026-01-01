import { emailStyles } from '../layouts/email-layout';

type SquareDetailsParams = {
  rowIndex: number;
  colIndex: number;
  rowTeamName: string;
  colTeamName: string;
  statusHtml?: string;
};

export function squareDetailsTable({
  rowIndex,
  colIndex,
  rowTeamName,
  colTeamName,
  statusHtml,
}: SquareDetailsParams): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="${emailStyles.detailsBox}">
      <tr>
        <td style="${emailStyles.detailsBoxPadding}">
          <p style="${emailStyles.detailsTitle}">Square Details</p>
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr style="${emailStyles.detailRow}">
              <td style="${emailStyles.detailLabel}">Position:</td>
              <td style="${emailStyles.detailValue}">Row ${rowIndex}, Column ${colIndex}</td>
            </tr>
            <tr style="${emailStyles.detailRow}">
              <td style="${emailStyles.detailLabel}">Teams:</td>
              <td style="${emailStyles.detailValue}">${rowTeamName} vs ${colTeamName}</td>
            </tr>
            ${statusHtml ? `<tr style="${emailStyles.detailRow}">${statusHtml}</tr>` : ''}
          </table>
        </td>
      </tr>
    </table>`;
}

export function ctaButton(text: string, url: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <a href="${url}" style="${emailStyles.ctaButton}">${text}</a>
        </td>
      </tr>
    </table>`;
}

