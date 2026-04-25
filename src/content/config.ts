import { defineCollection, z } from 'astro:content';

const sections = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    draft: z.boolean().optional(),
  }),
});

export const collections = { sections };
