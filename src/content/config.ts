import { defineCollection, z } from 'astro:content';

const teamsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(), // Nama Batch (misal: Batch 7)
    roles: z.array(z.object({
      role_name: z.string(),
      photos: z.array(z.string()) // Array path gambar
    }))
  })
});

export const collections = {
  'teams': teamsCollection,
};