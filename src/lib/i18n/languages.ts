export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  voiceLang: string; // BCP 47 language tag for SpeechSynthesis
  flag?: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', voiceLang: 'en-IN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', voiceLang: 'hi-IN' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', voiceLang: 'bn-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', voiceLang: 'te-IN' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', voiceLang: 'ta-IN' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', voiceLang: 'mr-IN' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', voiceLang: 'gu-IN' },
];

export type SupportedLanguageCode = 'en' | 'hi' | 'bn' | 'te' | 'ta' | 'mr' | 'gu';
