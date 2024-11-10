import { prisma } from '@/lib/prisma'

describe('Database Connection', () => {
    it('should connect to database', async () => {
        const result = await prisma.$runCommandRaw({
            ping: 1,
        })
        expect(result).toEqual({ ok: 1 })
    })

    it('should create an query a post', async () => {
        const post = await prisma.post.create({
            data: {
                title: 'Test Post',
                content: 'Test Content',
                tags: ['test'],
            },
        })

        expect(post).toHaveProperty('id')
        expect(post.title).toBe('Test Post')

        const foundPost = await prisma.post.findUnique({
            where: { id: post.id },
        })

        expect(foundPost).toBeTruthy()
        expect(foundPost?.title).toBe('Test Post')

        await prisma.post.delete({
            where: { id: post.id },
        })
    })

    it('should handle database operations', async () => {
        const posts = await prisma.post.createMany({
            data: [
                { title: 'Post 1', content: 'Content 1', tags: ['test'] },
                { title: 'Post 2', content: 'Content 2', tags: ['test'] },
            ],
        })

        expect(posts.count).toBe(2)

        const foundPosts = await prisma.post.findMany({
            where: {
                tags: {
                    has: 'test',
                },
            },
        })

        expect(foundPosts).toHaveLength(2)

        await prisma.post.deleteMany({
            where: {
                tags: {
                    has: 'test',
                },
            },
        })
    })
})
