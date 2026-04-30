export interface IdentificationResult {
  arabic?: string;
  english?: string;
  french?: string;
  timestamp: number;
  imageUrl: string;
  generatedImageUrl?: string;
}

export type Language = 'ar' | 'en' | 'fr';

export const LANGUAGE_NAMES: Record<Language, string> = {
  ar: 'العربية',
  en: 'English',
  fr: 'Français',
};
