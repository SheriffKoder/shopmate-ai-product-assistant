/**
 * Shadow Localization Model
 *
 * Purpose: Defines shared localized value shapes for shadow domain objects.
 * Used in: shadow category and product models.
 * Used for: Keeps EN/AR catalog text contracts consistent across entities.
 */

export type ShadowLocaleText = {
  en: string;
  ar: string;
};

export type ShadowLocalizedList = {
  en: string[];
  ar: string[];
};
