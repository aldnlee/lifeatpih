import { defineCollection, z } from 'astro:content';

const teamsCollection = defineCollection({
  type: 'data', // PENTING: Gunakan 'data' untuk file JSON
  schema: z.object({
    title: z.string(),
    roles: z.array(z.object({
      role_name: z.string(),
      photos: z.array(z.any()) // Menggunakan any agar fleksibel terhadap string/object
    }))
  })
});
// src/content/config.ts
const vacancies = defineCollection({
  type: 'content',
  schema: z.object({
    batch_name: z.string(),
    status: z.enum(["Open", "Closed"]),
    roles: z.array(z.object({
      role_title: z.string(),
      description: z.string().optional(),
    })),
  }),
});

export const collections = {
  'teams': teamsCollection,
  'vacancies': vacancies,
};