/**
 * Localization Model
 *
 * Purpose: Defines shared localized value shapes for domain objects.
 * Used in: category and product models.
 * Used for: Keeps EN/AR catalog text contracts consistent across entities.
 */

export type LocaleText = {
  en: string;
  ar: string;
};

export type LocalizedList = {
  en: string[];
  ar: string[];
};
