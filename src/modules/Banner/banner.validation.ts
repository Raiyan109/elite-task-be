import { z } from 'zod';

export const createSettingsSchema = z.object({
  title: z.string().optional(),
  favicon: z.string().optional(),
  logo: z.string().optional(),
});

export const updateSettingsSchema = z.object({
  title: z.string().optional(),
  favicon: z.string().optional(),
  logo: z.string().optional(),
});

export const SettingsValidation = {
  createSettingsSchema,
  updateSettingsSchema
};