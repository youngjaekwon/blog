import { CreatePostDTO } from '@/dtos/post/post.create.dto'
import { UpdatePostDTO } from '@/dtos/post/post.update.dto'
import { BaseRepository } from '@/repositories/base/base.repository'
import { PaginatedResponse } from '@/types/common/pagination.types'
import { FindManyArgs } from '@/types/common/repository.types'
import { Post, PrismaClient } from '@prisma/client'
import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'
import { PrismaPostDelegate } from '../post.repository'

describe('PostRepository', () => {
    let prismaMock: DeepMockProxy<PrismaClient>
    let delegateMock: DeepMockProxy<PrismaPostDelegate>
    let postRepository: BaseRepository<Post, CreatePostDTO, UpdatePostDTO>

    beforeEach(() => {
        prismaMock = mockDeep<PrismaClient>()
        delegateMock = mockDeep<PrismaPostDelegate>()
        delegateMock.getSearchFields.mockReturnValue(['title', 'content'])
        postRepository = new BaseRepository<Post, CreatePostDTO, UpdatePostDTO>(delegateMock)
    })

    afterEach(() => {
        mockReset(delegateMock)
    })

    describe('findById', () => {
        it('should return null when post not found', async () => {
            const validId = '507f1f77bcf86cd799439011'
            delegateMock.findUnique.mockResolvedValue(null)

            const result = await postRepository.findById(validId, { comments: true })

            expect(result).toBeNull()
            expect(delegateMock.findUnique).toHaveBeenCalledWith({
                where: { id: validId },
                include: { comments: true },
            })
        })

        it('should return post when found', async () => {
            const validId = '507f1f77bcf86cd799439011'
            const mockPost: Post & { comments: any[] } = {
                id: validId,
                title: 'Test Post',
                content: 'Test Content',
                createdAt: new Date(),
                updatedAt: new Date(),
                views: 0,
                tags: ['test'],
                comments: [],
            }

            delegateMock.findUnique.mockResolvedValue(mockPost)

            const result = await postRepository.findById(validId, { comments: true })

            expect(result).toEqual(mockPost)
            expect(delegateMock.findUnique).toHaveBeenCalledWith({
                where: { id: validId },
                include: { comments: true },
            })
        })
    })

    describe('create', () => {
        it('should create post with provided data', async () => {
            const createPostData: CreatePostDTO = {
                title: 'New Post',
                content: 'New Content',
                tags: ['new', 'test'],
            }

            const mockCreatedPost: Post = {
                id: '507f1f77bcf86cd799439011',
                title: createPostData.title,
                content: createPostData.content,
                tags: createPostData.tags ?? [],
                createdAt: new Date(),
                updatedAt: new Date(),
                views: 0,
            }

            delegateMock.create.mockResolvedValue(mockCreatedPost)

            const result = await postRepository.create(createPostData)

            expect(delegateMock.create).toHaveBeenCalledWith({
                data: createPostData,
            })
            expect(result).toEqual(mockCreatedPost)
        })
    })

    describe('findAll', () => {
        const mockPosts: Post[] = [
            {
                id: '507f1f77bcf86cd799439011',
                title: 'Test Post 1',
                content: 'Content 1',
                createdAt: new Date(),
                updatedAt: new Date(),
                views: 10,
                tags: ['test'],
            },
        ]

        it('should return posts with pagination and filtering', async () => {
            delegateMock.findMany.mockResolvedValue(mockPosts)
            delegateMock.count.mockResolvedValue(1)

            const params = {
                page: 1,
                limit: 10,
                search: 'Test',
                sort: 'title',
                order: 'asc',
            }

            const args = {
                where: {
                    OR: [{ title: { contains: params.search } }, { content: { contains: params.search } }],
                },
                orderBy: { title: 'asc' },
                skip: 0,
                take: 10,
            }

            const expectedPagination: PaginatedResponse<Post> = {
                items: mockPosts,
                meta: {
                    total: 1,
                    page: 1,
                    limit: 10,
                    totalPages: 1,
                    hasNext: false,
                    hasPrev: false,
                },
            }

            const result = await postRepository.findAll(params)

            expect(delegateMock.findMany).toHaveBeenCalledWith(args)
            expect(delegateMock.count).toHaveBeenCalledWith({
                where: args.where,
            })
            expect(result).toEqual(expectedPagination)
        })
    })

    describe('update', () => {
        it('should update post with provided data', async () => {
            const validId = '507f1f77bcf86cd799439011'
            const updateData: UpdatePostDTO = {
                title: 'Updated Post',
                tags: ['updated'],
            }

            const mockUpdatedPost: Post = {
                id: validId,
                title: updateData.title!,
                content: 'Original Content',
                createdAt: new Date(),
                updatedAt: new Date(),
                views: 0,
                tags: updateData.tags!,
            }

            delegateMock.update.mockResolvedValue(mockUpdatedPost)

            const result = await postRepository.update(validId, updateData)

            expect(delegateMock.update).toHaveBeenCalledWith({
                where: { id: validId },
                data: updateData,
            })
            expect(result).toEqual(mockUpdatedPost)
        })
    })

    describe('delete', () => {
        it('should delete post with valid id', async () => {
            const validId = '507f1f77bcf86cd799439011'
            await postRepository.delete(validId)

            expect(delegateMock.delete).toHaveBeenCalledWith({
                where: { id: validId },
            })
        })
    })
})
