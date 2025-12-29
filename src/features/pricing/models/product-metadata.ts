import z from 'zod';

export const priceCardVariantSchema = z.enum(['free', 'pro']);

export const productMetadataSchema = z
  .object({
    price_card_variant: priceCardVariantSchema,
    active_contests: z.string(),
    has_ads: z.string(),
  })
  .transform((data) => ({
    priceCardVariant: data.price_card_variant,
    activeContests: data.active_contests,
    hasAds: data.has_ads === 'true',
  }));

export type ProductMetadata = z.infer<typeof productMetadataSchema>;
export type PriceCardVariant = z.infer<typeof priceCardVariantSchema>;
