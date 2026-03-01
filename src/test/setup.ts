import '@testing-library/jest-dom'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from './mocks/server'

// Inicia o servidor de mocks antes de todos os testes
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// Limpa todos os testes após cada teste
afterEach(() => {
  cleanup()
  server.resetHandlers()
})

// Fecha o servidor de mocks após todos os testes
afterAll(() => server.close())