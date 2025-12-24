import { z } from 'zod';

// Schema for Step 1 - Basic Info
export const basicInfoSchema = z.object({
  name: z
    .string()
    .min(3, 'Contest name must be at least 3 characters')
    .max(100, 'Contest name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  rowTeamName: z.string().min(1, 'Row team name is required').max(50, 'Team name must be less than 50 characters'),
  colTeamName: z.string().min(1, 'Column team name is required').max(50, 'Team name must be less than 50 characters'),
});

// Base settings schema (without refine, for merging)
export const settingsBaseSchema = z.object({
  squarePrice: z.coerce.number().min(1, 'Price must be at least $1').max(10000, 'Price must be less than $10,000'),
  maxSquaresPerPerson: z.coerce
    .number()
    .min(1, 'Must allow at least 1 square per person')
    .max(100, 'Cannot exceed 100 squares per person')
    .optional()
    .nullable(),
  payoutQ1Percent: z.coerce.number().min(0).max(100),
  payoutQ2Percent: z.coerce.number().min(0).max(100),
  payoutQ3Percent: z.coerce.number().min(0).max(100),
  payoutFinalPercent: z.coerce.number().min(0).max(100),
});

// Settings schema with validation (for step validation)
export const settingsSchema = settingsBaseSchema.refine(
  (data) => data.payoutQ1Percent + data.payoutQ2Percent + data.payoutQ3Percent + data.payoutFinalPercent <= 100,
  {
    message: 'Total payout cannot exceed 100%',
    path: ['payoutFinalPercent'],
  }
);

// Schema for Step 3 - Branding
export const brandingSchema = z.object({
  heroImageUrl: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
  orgImageUrl: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
});

// Combined schema for full contest creation (with payout validation)
export const createContestSchema = basicInfoSchema
  .merge(settingsBaseSchema)
  .merge(brandingSchema)
  .refine(
    (data) => data.payoutQ1Percent + data.payoutQ2Percent + data.payoutQ3Percent + data.payoutFinalPercent <= 100,
    {
      message: 'Total payout cannot exceed 100%',
      path: ['payoutFinalPercent'],
    }
  );

// Type exports
export type BasicInfoInput = z.infer<typeof basicInfoSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
export type BrandingInput = z.infer<typeof brandingSchema>;
export type CreateContestInput = z.infer<typeof createContestSchema>;

// Default values for the form
export const defaultContestValues: CreateContestInput = {
  name: '',
  description: '',
  rowTeamName: '',
  colTeamName: '',
  squarePrice: 10,
  maxSquaresPerPerson: null,
  payoutQ1Percent: 20,
  payoutQ2Percent: 20,
  payoutQ3Percent: 20,
  payoutFinalPercent: 40,
  heroImageUrl: null,
  orgImageUrl: null,
  primaryColor: '#F97316',
  secondaryColor: '#D97706',
};
