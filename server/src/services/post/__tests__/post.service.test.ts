import { CreatePostDTO } from '@/dtos/post/post.create.dto'
import { Post } from '@/models/post/post.model'
import { IPostRepository } from '@/repositories/post/post.interface'
import { IPostService } from '@/services/post/post.interface'
import { PostService } from '@/services/post/post.service'

describe('PostService', () => {
    let postService: IPostService
    let mockPostRepository: jest.Mocked<IPostRepository>

    beforeEach(() => {
        mockPostRepository = {
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findAll: jest.fn(),
        }
        postService = new PostService(mockPostRepository)
    })

    describe('create', () => {
        it('should create a post', async () => {
            const postData: CreatePostDTO = {
                title: 'Test Post',
                content: 'Test Content',
                tags: ['test'],
            }
            const expectedPost: Post = {
                id: '1',
                ...postData,
                tags: ['test'],
                views: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockPostRepository.create.mockResolvedValue(expectedPost)

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
            const expectedPost: Post = {
                id: '1',
                ...postData,
                tags: [],
                views: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockPostRepository.create.mockResolvedValue(expectedPost)

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

    describe('retrieve', () => {
        it('should retrieve a post', async () => {
            const postId = '1'
            const mockPost: Post = {
                id: postId,
                title: 'Test Post',
                content: 'Test Content',
                tags: ['test'],
                views: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockPostRepository.findById.mockResolvedValue(mockPost)

            const post = await postService.retrieve(postId)

            expect(post).toEqual(mockPost)
        })

        it('should fail when post is not found', async () => {
            const postId = '1'

            mockPostRepository.findById.mockResolvedValue(null)

            await expect(postService.retrieve(postId)).rejects.toThrow()
        })

        it('should fail when post id is invalid', async () => {
            const postId = 'invalid-id'

            await expect(postService.retrieve(postId)).rejects.toThrow()
        })
    })
})
