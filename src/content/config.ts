import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        description: z.string(),
        publishDate: z.string(),
        author: z.string().default('Alex Morgan'),
        category: z.string(),
        categoryUrl: z.string(),
        readTime: z.string(),
        image: z.string().optional(),
        aeoSummary: z.string().optional(),
        tags: z.array(z.string()).optional(),
        toc: z.array(z.object({
            text: z.string(),
            url: z.string(),
        })).optional().default([]),
    }),
});

export const collections = {
    'blog': blogCollection,
};
