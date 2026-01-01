export const ContestErrors = {
  NOT_FOUND: 'Contest not found',
  UNAUTHORIZED: 'You must be logged in',
  NOT_OWNER: 'You do not own this contest',
  NOT_OPEN: 'This contest is not currently accepting claims',
  SQUARE_TAKEN: 'This square has already been claimed. Please select another.',
  SQUARE_NOT_FOUND: 'Square not found',
  FAILED_TO_CLAIM: 'Failed to claim square. Please try again.',
  RACE_CONDITION: 'This square was just claimed by someone else. Please select another.',
  SCORES_ONLY_IN_PROGRESS: 'Scores can only be entered when the contest is in progress',
  NUMBERS_REQUIRED: 'Grid numbers must be assigned before entering scores',
  INVALID_STATUS: 'Invalid status value',
  ALL_FIELDS_REQUIRED: 'All required fields must be provided',
  NO_SQUARES_SELECTED: 'No squares selected',
  FAILED_TO_UPDATE: 'Failed to update square status',
  FAILED_TO_DELETE: 'Failed to delete',
} as const;

export const MAX_SQUARES_REACHED = (max: number): string =>
  `You have already claimed the maximum of ${max} square(s) for this contest.`;

