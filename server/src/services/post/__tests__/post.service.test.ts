import { PostService } from '@/services/post/post.service'
import { prisma } from '@/lib/prisma'
import { CreatePostDTO } from '@/dtos/post/post.create.dto'

describe('PostService', () => {
    let postService: PostService

    beforeEach(() => {
        postService = new PostService()
    })

    afterEach(async () => {
        await prisma.post.deleteMany()
    })

    describe('create', () => {
        it('should create a post', async () => {
            const postData: CreatePostDTO = {
                title: 'Test Post',
                content: 'Test Content',
                tags: ['test'],
            }

            const post = await postService.create(postData)

            expect(post).toBeDefined()
            expect(post.title).toBe(postData.title)
            expect(post.content).toBe(postData.content)
            expect(post.tags).toEqual(postData.tags ? expect.arrayContaining(postData.tags) : [])
        })

        it('should fail when title is empty', async () => {
            const postData: CreatePostDTO = {
                title: '',
                content: 'Test Content',
                tags: ['test'],
            }

            await expect(postService.create(postData)).rejects.toThrow()
        })

        it('should fail when content is empty', async () => {
            const postData: CreatePostDTO = {
                title: 'Test Title',
                content: '',
                tags: ['test'],
            }

            await expect(postService.create(postData)).rejects.toThrow()
        })

        it('should fail when title exceeds maximum length', async () => {
            const postData: CreatePostDTO = {
                title: 'a'.repeat(256),
                content: 'Test Content',
                tags: ['test'],
            }

            await expect(postService.create(postData)).rejects.toThrow()
        })

        it('should create post without tags', async () => {
            const postData: CreatePostDTO = {
                title: 'Test Post',
                content: 'Test Content',
            }

            const post = await postService.create(postData)

            expect(post).toBeDefined()
            expect(post.tags).toHaveLength(0)
        })

        it('should fail when tags exceed maximum count', async () => {
            const postData: CreatePostDTO = {
                title: 'Test Post',
                content: 'Test Content',
                tags: Array(11).fill('tag'),
            }

            await expect(postService.create(postData)).rejects.toThrow()
        })

        it('should fail when tag length exceed maximum', async () => {
            const postData: CreatePostDTO = {
                title: 'Test Post',
                content: 'Test Content',
                tags: ['a'.repeat(51)],
            }

            await expect(postService.create(postData)).rejects.toThrow()
        })
    })
})
