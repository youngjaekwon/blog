import { z } from 'zod'

export const paginationSchema = z.object({
    page: z.coerce.number().optional().default(1),
    limit: z.coerce.number().optional().default(10),
    search: z.string().optional(),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
})
