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

export const updatePostSchema = z
    .object({
        title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters').optional(),
        content: z.string().min(1, 'Content is required').optional(),
        tags: z
            .array(z.string().max(50, 'Tag must be less tahn 50 characters'))
            .max(10, 'Maximum 10 tags allowed')
            .default([])
            .optional(),
    })
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
        message: 'At least one field must be provided for update',
    })

export const responsePostSchema = z.object({
    id: z.string(),
    title: z.string(),
    content: z.string(),
    tags: z.array(z.string()),
    createdAt: z.date(),
    updatedAt: z.date(),
    views: z.number(),
})
