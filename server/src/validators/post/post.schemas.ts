import { z } from 'zod'

export const createPostSchema = z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
    content: z.string().min(1, 'Content is required'),
    tags: z
        .array(z.string().max(50, 'Tag must be less tahn 50 characters'))
        .max(10, 'Maximum 10 tags allowed')
        .default([])
        .optional(),
})
