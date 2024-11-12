// src/repositories/post/__tests__/post.repository.test.ts
import { PrismaClient, Post as PrismaPost, Comment as PrismaComment, Prisma } from '@prisma/client'
import { PostRepository } from '../post.repository'
import { CreatePostDTO } from '@/dtos/post/post.create.dto'
import { UpdatePostDTO } from '@/dtos/post/post.update.dto'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'

describe('PostRepository', () => {
    let prisma: DeepMockProxy<PrismaClient>
    let postRepository: PostRepository

    beforeEach(() => {
        prisma = mockDeep<PrismaClient>()
        postRepository = new PostRepository(prisma)
    })

    afterEach(() => {
        mockReset(prisma)
    })

    describe('findById', () => {
        it('should return null for invalid ObjectId', async () => {
            const result = await postRepository.findById('invalid-id')
            expect(result).toBeNull()
            expect(prisma.post.findUnique).not.toHaveBeenCalled()
        })

        it('should return null when post not found', async () => {
            const validId = '507f1f77bcf86cd799439011'
            prisma.post.findUnique.mockResolvedValue(null)

            const result = await postRepository.findById(validId)

            expect(result).toBeNull()
            expect(prisma.post.findUnique).toHaveBeenCalledWith({
                where: { id: validId },
                include: { comments: true }
            })
        })

        it('should return mapped post with comments when found', async () => {
            const validId = '507f1f77bcf86cd799439011'
            const mockPrismaPost: PrismaPost & { comments: PrismaComment[] } = {
                id: validId,
                title: 'Test Post',
                content: 'Test Content',
                createdAt: new Date(),
                updatedAt: new Date(),
                views: 0,
                tags: ['test'],
                comments: [{
                    id: '507f1f77bcf86cd799439012',
                    content: 'Test Comment',
                    author: 'Test Author',
                    isAnonymous: false,
                    postId: validId,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }]
            }

            prisma.post.findUnique.mockResolvedValue(mockPrismaPost)

            const result = await postRepository.findById(validId)

            expect(result).toEqual({
                ...mockPrismaPost,
                comments: expect.arrayContaining([
                    expect.objectContaining({
                        id: mockPrismaPost.comments[0].id
                    })
                ])
            })
        })
    })

    describe('create', () => {
        it('should create post with provided data', async () => {
            const createPostData: CreatePostDTO = {
                title: 'New Post',
                content: 'New Content',
                tags: ['new', 'test']
            }

            const mockCreatedPost: Prisma.PostGetPayload<{
                include: { comments: true }
            }> = {
                id: '507f1f77bcf86cd799439011',
                title: createPostData.title,
                content: createPostData.content,
                tags: createPostData.tags ?? [],
                createdAt: new Date(),
                updatedAt: new Date(),
                views: 0,
                comments: []
            }

            prisma.post.create.mockResolvedValue(mockCreatedPost)

            const result = await postRepository.create(createPostData)

            expect(prisma.post.create).toHaveBeenCalledWith({
                data: {
                    title: createPostData.title,
                    content: createPostData.content,
                    tags: createPostData.tags,
                },
                include: { comments: true }
            })
            expect(result).toEqual(mockCreatedPost)
        })

        it('should create post with empty tags array when tags not provided', async () => {
            // Given
            const createPostData: CreatePostDTO = {
                title: 'New Post',
                content: 'New Content'
            }

            const mockCreatedPost: Prisma.PostGetPayload<{
                include: { comments: true }
            }> = {
                id: '507f1f77bcf86cd799439011',
                title: createPostData.title,
                content: createPostData.content,
                tags: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                views: 0,
                comments: []
            }

            prisma.post.create.mockResolvedValue(mockCreatedPost)

            // When
            const result = await postRepository.create(createPostData)

            // Then
            expect(prisma.post.create).toHaveBeenCalledWith({
                data: {
                    title: createPostData.title,
                    content: createPostData.content,
                    tags: createPostData.tags,
                },
                include: { comments: true }
            })
            expect(result).toEqual(mockCreatedPost)
        })
    })

    describe('findAll', () => {
        const mockPosts: Prisma.PostGetPayload<{
            include: { comments: true }
        }>[] = [{
            id: '507f1f77bcf86cd799439011',
            title: 'Test Post 1',
            content: 'Content 1',
            createdAt: new Date(),
            updatedAt: new Date(),
            views: 10,
            tags: ['test'],
            comments: []
        }]
    
        beforeEach(() => {
            prisma.post.findMany.mockResolvedValue(mockPosts)
            prisma.post.count.mockResolvedValue(1)
        })

        it('should apply pagination, sorting and filtering', async () => {
            const mockPosts: (PrismaPost & { comments: PrismaComment[] })[] = [
                {
                    id: '507f1f77bcf86cd799439011',
                    title: 'Test Post 1',
                    content: 'Content 1',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    views: 10,
                    tags: ['test'],
                    comments: []
                }
            ]

            prisma.post.findMany.mockResolvedValue(mockPosts)
            prisma.post.count.mockResolvedValue(1)

            const result = await postRepository.findAll({
                pagination: { page: 1, limit: 10 },
                sort: { createdAt: 'desc' },
                filter: { 
                    title: { $regex: 'test' },
                    views: { $gte: 5 }
                }
            })

            expect(prisma.post.findMany).toHaveBeenCalledWith({
                where: expect.objectContaining({
                    title: { contains: 'test' },
                    views: { gte: 5 }
                }),
                skip: 0,
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: { comments: true }
            })

            expect(result.total).toBe(1)
            expect(result.items).toHaveLength(1)
            expect(result.items[0]).toEqual(expect.objectContaining({
                id: mockPosts[0].id
            }))
        })

        it('should use default pagination when not provided', async () => {
            await postRepository.findAll({})

            expect(prisma.post.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    skip: 0,
                    take: 10
                })
            )
        })
    })

    describe('update', () => {
        it('should throw error for invalid ObjectId', async () => {
            const updateData: UpdatePostDTO = { title: 'Updated' }
            await expect(postRepository.update('invalid-id', updateData))
                .rejects
                .toThrow('Invalid Id format')
        })

        it('should update post with provided data', async () => {
            const validId = '507f1f77bcf86cd799439011'
            const updateData: UpdatePostDTO = {
                title: 'Updated Post',
                tags: ['updated']
            }

            const mockUpdatedPost: PrismaPost & { comments: PrismaComment[] } = {
                id: validId,
                title: updateData.title!,
                content: 'Original Content',
                createdAt: new Date(),
                updatedAt: new Date(),
                views: 0,
                tags: updateData.tags!,
                comments: []
            }

            prisma.post.update.mockResolvedValue(mockUpdatedPost)

            const result = await postRepository.update(validId, updateData)

            expect(prisma.post.update).toHaveBeenCalledWith({
                where: { id: validId },
                data: updateData,
                include: { comments: true }
            })
            expect(result).toEqual(mockUpdatedPost)
        })
    })

    describe('delete', () => {
        it('should throw error for invalid ObjectId', async () => {
            await expect(postRepository.delete('invalid-id'))
                .rejects
                .toThrow('Invalid Id format')
        })

        it('should delete post with valid id', async () => {
            const validId = '507f1f77bcf86cd799439011'
            await postRepository.delete(validId)

            expect(prisma.post.delete).toHaveBeenCalledWith({
                where: { id: validId }
            })
        })
    })
})