// Centralized timeline translations for all 8 languages
// This file consolidates timeline content from src/content/timeline/*

export interface TimelineStep {
  number: string;
  title: string;
  description: string;
  duration: string;
  keyAction: string;
  priority: string;
  detailedInfo: string;
  keyPoints: string[];
  clickToSeeDetails?: string;
  openAccountLabel?: string;
}

import { timelineEn } from '@/content/timeline/en';
import { timelineEs } from '@/content/timeline/es';
import { timelinePt } from '@/content/timeline/pt';
import { timelineDe } from '@/content/timeline/de';
import { timelineFr } from '@/content/timeline/fr';
import { timelineHe } from '@/content/timeline/he';
import { timelineRu } from '@/content/timeline/ru';
import { timelineUk } from '@/content/timeline/uk';

export const TIMELINE_TRANSLATIONS: Record<string, TimelineStep[]> = {
  en: timelineEn,
  es: timelineEs,
  pt: timelinePt,
  de: timelineDe,
  fr: timelineFr,
  he: timelineHe,
  ru: timelineRu,
  uk: timelineUk,
};
