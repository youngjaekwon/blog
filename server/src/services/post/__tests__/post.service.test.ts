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

    describe('findAll', () => {
        it('should retrieve all posts', async () => {
            const mockPosts: Post[] = [
                {
                    id: '1',
                    title: 'Test Post 1',
                    content: 'Test Content 1',
                    tags: ['test'],
                    views: 0,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: '2',
                    title: 'Test Post 2',
                    content: 'Test Content 2',
                    tags: ['test'],
                    views: 0,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ]

            const expectedResponse = {
                items: mockPosts,
                meta: {
                    total: mockPosts.length,
                    page: 1,
                    limit: 10,
                    totalPages: 1,
                    hasNext: false,
                    hasPrev: false,
                },
            }

            mockPostRepository.findAll.mockResolvedValue(expectedResponse)

            const posts = await postService.findAll()

            expect(posts).toEqual(expectedResponse)
        })

        it('should retrieve all posts with empty data', async () => {
            const expectedResponse = {
                items: [],
                meta: {
                    total: 0,
                    page: 1,
                    limit: 10,
                    totalPages: 1,
                    hasNext: false,
                    hasPrev: false,
                },
            }
            mockPostRepository.findAll.mockResolvedValue(expectedResponse)

            const posts = await postService.findAll()

            expect(posts).toEqual(expectedResponse)
        })
    })

    describe('update', () => {
        it('should update a post', async () => {
            const postId = '1'
            const postData: CreatePostDTO = {
                title: 'Test Post',
                content: 'Test Content',
                tags: ['test'],
            }
            const updatedPost: Post = {
                id: postId,
                ...postData,
                tags: ['test'],
                views: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockPostRepository.update.mockResolvedValue(updatedPost)

            const post = await postService.update(postId, postData)

            expect(post).toEqual(updatedPost)
        })

        it('should fail when post is not found', async () => {
            const postId = '1'
            const postData: CreatePostDTO = {
                title: 'Test Post',
                content: 'Test Content',
                tags: ['test'],
            }

            mockPostRepository.update.mockRejectedValue(Error())

            await expect(postService.update(postId, postData)).rejects.toThrow()
        })

        it('should fail when post id is invalid', async () => {
            const postId = 'invalid-id'
            const postData: CreatePostDTO = {
                title: 'Test Post',
                content: 'Test Content',
                tags: ['test'],
            }

            mockPostRepository.update.mockRejectedValue(Error())

            await expect(postService.update(postId, postData)).rejects.toThrow()
        })
    })

    describe('delete', () => {
        it('should delete a post', async () => {
            const postId = '1'

            mockPostRepository.delete.mockResolvedValue()

            await postService.delete(postId)

            expect(mockPostRepository.delete).toHaveBeenCalledWith(postId)
        })

        it('should fail when post is not found', async () => {
            const postId = '1'

            mockPostRepository.delete.mockRejectedValue(Error())

            await expect(postService.delete(postId)).rejects.toThrow()
        })

        it('should fail when post id is invalid', async () => {
            const postId = 'invalid-id'

            mockPostRepository.delete.mockRejectedValue(Error())

            await expect(postService.delete(postId)).rejects.toThrow()
        })
    })
})
