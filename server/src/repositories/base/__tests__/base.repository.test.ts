import { DatabaseError, DuplicateError } from '@/errors/common/database.error'
import { BaseDelegate, BaseRepository } from '@/repositories/base/base.repository'
import { DEFAULT_PAGINATION } from '@/types/common/pagination.types'
import { RepositoryDelegate } from '@/types/common/repository.types'
import { PrismaClientInitializationError, PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

// 테스트용 모델 및 DTO 타입
interface TestModel {
    id: string
    name: string
}

interface CreateTestDTO {
    name: string
}

interface UpdateTestDTO {
    name?: string
}

describe('BaseRepository', () => {
    let repository: BaseRepository<TestModel, CreateTestDTO, UpdateTestDTO>
    let mockDelegate: jest.Mocked<RepositoryDelegate<TestModel, CreateTestDTO, UpdateTestDTO>>

    beforeEach(() => {
        mockDelegate = {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
            getSearchFields: jest.fn(),
        }
        mockDelegate.getSearchFields.mockReturnValue(['name'])

        repository = new BaseRepository(mockDelegate)
    })

    describe('findById', () => {
        it('should find an item by id', async () => {
            // Given
            const mockItem: TestModel = { id: '1', name: 'Test' }
            mockDelegate.findUnique.mockResolvedValue(mockItem)

            // When
            const result = await repository.findById('1', { relations: true })

            // Then
            expect(mockDelegate.findUnique).toHaveBeenCalledWith({
                where: { id: '1' },
                include: { relations: true },
            })
            expect(result).toEqual(mockItem)
        })

        it('should return null when item not found', async () => {
            // Given
            mockDelegate.findUnique.mockResolvedValue(null)

            // When
            const result = await repository.findById('1')

            // Then
            expect(result).toBeNull()
        })
    })

    describe('findAll', () => {
        it('should return paginated results with default pagination', async () => {
            // Given
            const mockItems: TestModel[] = [
                { id: '1', name: 'Test 1' },
                { id: '2', name: 'Test 2' },
            ]
            mockDelegate.findMany.mockResolvedValue(mockItems)
            mockDelegate.count.mockResolvedValue(2)

            // When
            const result = await repository.findAll()

            // Then
            expect(result).toEqual({
                items: mockItems,
                meta: {
                    total: 2,
                    page: DEFAULT_PAGINATION.page,
                    limit: DEFAULT_PAGINATION.limit,
                    totalPages: 1,
                    hasNext: false,
                    hasPrev: false,
                },
            })
        })

        it('should handle custom pagination parameters', async () => {
            // Given
            const mockItems: TestModel[] = [{ id: '1', name: 'Test 1' }]
            mockDelegate.findMany.mockResolvedValue(mockItems)
            mockDelegate.count.mockResolvedValue(21)

            // When
            const result = await repository.findAll({
                page: 3,
                limit: 10,
                search: 'Test',
                sort: 'name',
                order: 'asc',
            })

            // Then
            expect(mockDelegate.findMany).toHaveBeenCalledWith({
                where: {
                    OR: [{ name: { contains: 'Test' } }],
                },
                orderBy: { name: 'asc' },
                skip: 20,
                take: 10,
            })
            expect(result.meta).toEqual({
                total: 21,
                page: 3,
                limit: 10,
                totalPages: 3,
                hasNext: false,
                hasPrev: true,
            })
        })
    })

    describe('create', () => {
        it('should create an item', async () => {
            // Given
            const mockItem: TestModel = { id: '1', name: 'Test' }
            const createDTO: CreateTestDTO = { name: 'Test' }
            mockDelegate.create.mockResolvedValue(mockItem)

            // When
            const result = await repository.create(createDTO, { relations: true })

            // Then
            expect(mockDelegate.create).toHaveBeenCalledWith({
                data: createDTO,
                include: { relations: true },
            })
            expect(result).toEqual(mockItem)
        })
    })

    describe('update', () => {
        it('should update an item', async () => {
            // Given
            const mockItem: TestModel = { id: '1', name: 'Updated' }
            const updateDTO: UpdateTestDTO = { name: 'Updated' }
            mockDelegate.update.mockResolvedValue(mockItem)

            // When
            const result = await repository.update('1', updateDTO)

            // Then
            expect(mockDelegate.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: updateDTO,
                include: undefined,
            })
            expect(result).toEqual(mockItem)
        })
    })

    describe('delete', () => {
        it('should delete an item', async () => {
            // Given
            mockDelegate.delete.mockResolvedValue({ id: '1', name: 'Test' })

            // When
            await repository.delete('1')

            // Then
            expect(mockDelegate.delete).toHaveBeenCalledWith({
                where: { id: '1' },
            })
        })
    })
})

describe('BaseDelegate', () => {
    class TestDelegate extends BaseDelegate {
        async testQuery<T>(query: () => Promise<T>): Promise<T> {
            return this.executeQuery(query)
        }
    }

    let delegate: TestDelegate

    beforeEach(() => {
        delegate = new TestDelegate()
    })

    it('should execute successful query', async () => {
        // Given
        const mockData = { id: '1', name: 'Test' }
        const mockQuery = jest.fn().mockResolvedValue(mockData)

        // When
        const result = await delegate.testQuery(mockQuery)

        // Then
        expect(result).toEqual(mockData)
        expect(mockQuery).toHaveBeenCalled()
    })

    it('should handle database connection error', async () => {
        // Given
        const mockQuery = jest.fn().mockRejectedValue(new PrismaClientInitializationError('Connection failed', '500'))

        // When & Then
        await expect(delegate.testQuery(mockQuery)).rejects.toThrow(DatabaseError)
    })

    it('should handle unique constraint violation', async () => {
        // Given
        const mockQuery = jest.fn().mockRejectedValue(
            new PrismaClientKnownRequestError('Unique constraint violation', {
                code: 'P2002',
                clientVersion: '4.0.0',
            })
        )

        // When & Then
        await expect(delegate.testQuery(mockQuery)).rejects.toThrow(DuplicateError)
    })

    it('should pass through other errors', async () => {
        // Given
        const mockError = new Error('Unknown error')
        const mockQuery = jest.fn().mockRejectedValue(mockError)

        // When & Then
        await expect(delegate.testQuery(mockQuery)).rejects.toThrow(mockError)
    })
})
