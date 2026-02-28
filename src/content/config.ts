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

export const collections = {
  'teams': teamsCollection,
};