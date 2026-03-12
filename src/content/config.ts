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
  type: 'data', // PENTING: Gunakan 'data' untuk YAML/JSON
  schema: z.object({
    batch_id: z.string(),
    batch_name: z.string(),
    status: z.string(),
    roles: z.array(z.object({
      role_title: z.string(),
      description: z.string().optional()
    })),
    body: z.string().optional(),
    // Tambahkan ini jika CMS membungkus data dalam 'map'
    map: z.any().optional(), 
  }),
});



export const collections = {
  'teams': teamsCollection,
  'vacancies': vacancies,
};