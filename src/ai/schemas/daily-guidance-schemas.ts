import { z } from 'zod';
import { UserProfileDataSchema } from './user-profile-schemas';

/**
 * Input schema for the daily guidance flow.
 * It wraps the user's profile data and includes the desired language.
 */
export const DailyGuidanceInputSchema = z.object({
  profile: UserProfileDataSchema.describe("The user's complete energy profile data."),
  language: z.enum(['en', 'zh']).optional().describe('The desired language for the AI response. Defaults to English.'),
  targetDate: z.string().describe("The target date for the guidance in YYYY-MM-DD format."),
  temperature: z.number().optional().describe('Controls randomness. 0 for deterministic, 1 for max creative.'),
});
export type DailyGuidanceInput = z.infer<typeof DailyGuidanceInputSchema>;


/**
 * The schema for the "crystal fortune" part of the daily guidance.
 */
const CrystalFortuneSchema = z.object({
  crystalName: z.string().describe("The name of the single recommended crystal for the day."),
  reason: z.string().describe("A brief, insightful reason for the crystal recommendation, tailored to the user's profile.")
});


/**
 * Output schema for the daily guidance flow.
 * It contains three distinct pieces of personalized guidance.
 */
export const DailyGuidanceOutputSchema = z.object({
  crystalFortune: CrystalFortuneSchema.describe("The daily crystal recommendation."),
  meditationScript: z.string().describe("A short, personalized meditation or mindfulness script for the day."),
  energyReminder: z.string().describe("A concise, thought-provoking energy insight or reminder for the day.")
});
export type DailyGuidanceOutput = z.infer<typeof DailyGuidanceOutputSchema>;

export const DailyEnergyStateSchema = z.object({
  date: z.string().describe("The date for the energy state in ISO format."),
  energyLevel: z.number().describe("Energy level from 1 to 5."),
  dominantChakra: z.string().describe("The dominant chakra for the day."),
  recommendedCrystal: z.string().describe("The recommended crystal for the day."),
  energyColor: z.string().describe("A hex color code representing the energy."),
  mbtiMood: z.string().describe("A mood descriptor based on MBTI-like personality."),
  elementBalance: z.string().describe("A descriptor for the elemental balance."),
  isSpecialDay: z.boolean().optional().describe("Whether it is a special day."),
  specialType: z.enum(['birthday', 'zodiac', 'chakra', 'element']).optional().describe("The type of special day."),
});
