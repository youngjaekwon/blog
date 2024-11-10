import type { Config } from 'jest'

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/__test__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
    setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
}

export default config
