import { defineCollection, z } from 'astro:content';

const teamsCollection = defineCollection({
  type: 'data', // Gunakan 'data' untuk file YAML/JSON
  schema: z.object({
    title: z.string(),
    roles: z.array(z.object({
      role_name: z.string(),
      photos: z.array(z.any()) // Menggunakan any agar fleksibel terhadap string/object
    }))
  })
});

// SKEMA VACANCIES DENGAN TIMELINE_DETAILS (DIPERBAIKI)
const vacancies = defineCollection({
  type: 'data',
  schema: z.object({
    batch_id: z.string(),
    batch_name: z.string(),
    status: z.string(),
    
    // --- TAMBAHKAN VALIDASI TIMELINE_DETAILS DI SINI ---
    timeline_details: z.array(
      z.object({
        step_name: z.string(),
        period: z.string(),
        is_active: z.boolean().optional().default(false)
      })
    ).optional(),

    roles: z.array(z.object({
      role_title: z.string(),
      description: z.string().optional()
    })),
    body: z.string().optional(),
    map: z.any().optional(), 
  }),
});

const rolesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    category: z.string(),
    icon: z.string(),
    description: z.string().optional(),
  }),
});

export const collections = {
  'teams': teamsCollection,
  'vacancies': vacancies,
  'roles': rolesCollection,
};