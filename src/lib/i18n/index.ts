import { en } from './en';
import { bn } from './bn';

export const translations = {
  en,
  bn,
};

export type Locale = keyof typeof translations;
