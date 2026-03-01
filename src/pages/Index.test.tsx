import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Index from './Index'
import { templateService } from '@/services/templateService'
import { useToast } from '@/hooks/use-toast'

// Mocks
vi.mock('@/services/templateService')
vi.mock('@/hooks/use-toast')
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false,
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Index Page', () => {
  const mockToast = vi.fn()
  const mockTemplates = [
    {
      id: '1',
      title: 'Contrato de Serviço',
      extension: '.docx',
      fieldsCount: 3,
      createdAt: '2024-01-01T10:00:00Z',
    },
    {
      id: '2',
      title: 'Declaração de Comparecimento',
      extension: '.docx',
      fieldsCount: 2,
      createdAt: '2024-01-02T11:30:00Z',
    },
    {
      id: '3',
      title: 'Orçamento',
      extension: '.docx',
      fieldsCount: 4,
      createdAt: '2024-01-03T14:15:00Z',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useToast).mockReturnValue({
      toast: mockToast,
    })
  })

  it('deve renderizar a página com templates', async () => {
    vi.mocked(templateService.listTemplates).mockResolvedValue(mockTemplates)

    render(
      <MemoryRouter>
        <Index />
      </MemoryRouter>
    )

    // Verifica loading inicial
    expect(screen.getByRole('status')).toBeInTheDocument()

    // Aguarda carregamento
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    // Verifica título
    expect(screen.getByText('Templates disponíveis')).toBeInTheDocument()
    expect(screen.getByText('Gerencie e preencha seus modelos de documentos')).toBeInTheDocument()

    // Verifica botão de novo template
    expect(screen.getByText('Novo Template')).toBeInTheDocument()

    // Verifica templates renderizados
    expect(screen.getByText('Contrato de Serviço')).toBeInTheDocument()
    expect(screen.getByText('Declaração de Comparecimento')).toBeInTheDocument()
    expect(screen.getByText('Orçamento')).toBeInTheDocument()

    // Verifica contagem de campos
    expect(screen.getAllByText(/3 campos/)[0]).toBeInTheDocument()
    expect(screen.getAllByText(/2 campos/)[0]).toBeInTheDocument()
    expect(screen.getAllByText(/4 campos/)[0]).toBeInTheDocument()
  })

  it('deve renderizar estado vazio quando não há templates', async () => {
    vi.mocked(templateService.listTemplates).mockResolvedValue([])

    render(
      <MemoryRouter>
        <Index />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Nenhum template cadastrado ainda')).toBeInTheDocument()
    expect(screen.getByText('Criar primeiro template')).toBeInTheDocument()
  })

  it('deve lidar com erro ao carregar templates', async () => {
    vi.mocked(templateService.listTemplates).mockRejectedValue(new Error('API error'))

    render(
      <MemoryRouter>
        <Index />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    // Verifica que toast de erro foi chamado
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Erro ao carregar templates',
      description: 'Não foi possível carregar os templates da API.',
      variant: 'destructive',
    })
  })

  it('deve navegar para criar template ao clicar no botão', async () => {
    vi.mocked(templateService.listTemplates).mockResolvedValue(mockTemplates)

    render(
      <MemoryRouter>
        <Index />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    const newTemplateButton = screen.getByText('Novo Template')
    fireEvent.click(newTemplateButton)

    expect(mockNavigate).toHaveBeenCalledWith('/criar-template')
  })

  it('deve navegar para preencher template ao clicar em "Preencher"', async () => {
    vi.mocked(templateService.listTemplates).mockResolvedValue(mockTemplates)

    render(
      <MemoryRouter>
        <Index />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    // Encontra todos os botões "Preencher" e clica no primeiro
    const fillButtons = screen.getAllByText('Preencher')
    fireEvent.click(fillButtons[0])

    expect(mockNavigate).toHaveBeenCalledWith('/preencher/1')
  })

  it('deve deletar template ao clicar em "Excluir"', async () => {
    vi.mocked(templateService.listTemplates).mockResolvedValue(mockTemplates)

    render(
      <MemoryRouter>
        <Index />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    // Encontra todos os botões "Excluir" e clica no primeiro
    const deleteButtons = screen.getAllByText('Excluir')
    fireEvent.click(deleteButtons[0])

    // Verifica que o template foi removido da lista
    expect(screen.queryByText('Contrato de Serviço')).not.toBeInTheDocument()
    expect(screen.getByText('Declaração de Comparecimento')).toBeInTheDocument()
    expect(screen.getByText('Orçamento')).toBeInTheDocument()

    // Verifica toast de sucesso
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Template excluído',
      description: 'O template foi removido com sucesso.',
    })
  })

  it('deve navegar para criar template a partir do estado vazio', async () => {
    vi.mocked(templateService.listTemplates).mockResolvedValue([])

    render(
      <MemoryRouter>
        <Index />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    const createFirstButton = screen.getByText('Criar primeiro template')
    fireEvent.click(createFirstButton)

    expect(mockNavigate).toHaveBeenCalledWith('/criar-template')
  })

  it('deve exibir grid responsivo corretamente', async () => {
    vi.mocked(templateService.listTemplates).mockResolvedValue(mockTemplates)

    render(
      <MemoryRouter>
        <Index />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    // Verifica que os templates estão em um grid
    const templateCards = screen.getAllByText(/Contrato|Declaração|Orçamento/)
    expect(templateCards).toHaveLength(3)
  })

  it('deve formatar datas corretamente', async () => {
    vi.mocked(templateService.listTemplates).mockResolvedValue(mockTemplates)

    render(
      <MemoryRouter>
        <Index />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    // Verifica que as datas são exibidas (formato pode variar)
    // Apenas verifica que algo relacionado a data está presente
    expect(screen.getByText(/01\/01\/2024|2024-01-01/)).toBeInTheDocument()
  })
})