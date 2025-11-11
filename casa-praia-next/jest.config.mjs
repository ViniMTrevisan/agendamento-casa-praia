import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // O caminho para o seu app Next.js (com a pasta 'src')
  dir: './',
});

/** @type {import('jest').Config} */
const config = {
  // Adiciona @testing-library/jest-dom (para matchers como .toBeInTheDocument())
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  
  // Ambiente (JSDOM simula um navegador)
  testEnvironment: 'jest-environment-jsdom',
  
  // Ignora a pasta de E2E (Playwright) para o Jest não tentar rodá-la
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/tests/e2e/'],
  
  // Mapeia o alias '@/' (do tsconfig.json) para o Jest
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // Usa o compilador SWC do Next.js (muito mais rápido que o Babel)
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['@swc/jest'],
  },
};

export default createJestConfig(config);