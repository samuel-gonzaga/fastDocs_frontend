import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CriarTemplate from './CriarTemplate'
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

describe('CriarTemplate Page', () => {
  const mockToast = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useToast).mockReturnValue({
      toast: mockToast,
    })
  })

  it('deve renderizar a página corretamente', () => {
    render(
      <MemoryRouter>
        <CriarTemplate />
      </MemoryRouter>
    )

    // Verifica elementos principais
    expect(screen.getByText('Criar Novo Template')).toBeInTheDocument()
    expect(screen.getByText('Voltar para início')).toBeInTheDocument()
    expect(screen.getByText('Nome do template')).toBeInTheDocument()
    expect(screen.getByText('Arquivo do template')).toBeInTheDocument()
    expect(screen.getByText('Criar Template')).toBeInTheDocument()

    // Verifica instruções
    expect(screen.getByText('Como criar templates')).toBeInTheDocument()
    expect(screen.getByText(/Use marcadores no formato/)).toBeInTheDocument()
    expect(screen.getByText(/Exemplo: {{nome}}, {{data}}, {{valor}}/)).toBeInTheDocument()
  })

  it('deve validar campos obrigatórios', async () => {
    render(
      <MemoryRouter>
        <CriarTemplate />
      </MemoryRouter>
    )

    const submitButton = screen.getByText('Criar Template')
    fireEvent.click(submitButton)

    // Verifica toast de erro
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Campos obrigatórios',
      description: 'Preencha todos os campos para continuar.',
      variant: 'destructive',
    })
  })

  it('deve criar template com sucesso', async () => {
    vi.mocked(templateService.createTemplate).mockResolvedValue({
      id: '1',
      title: 'Novo Template',
      extension: '.docx',
      fieldsCount: 0,
      createdAt: '2024-01-01T10:00:00Z',
    })

    render(
      <MemoryRouter>
        <CriarTemplate />
      </MemoryRouter>
    )

    // Preenche nome
    const nameInput = screen.getByPlaceholderText('Ex: Contrato de Prestação de Serviços')
    fireEvent.change(nameInput, { target: { value: 'Meu Novo Template' } })

    // Simula upload de arquivo
    const file = new File(['conteúdo do arquivo'], 'template.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
    const fileInput = screen.getByLabelText('Arquivo do template')
    fireEvent.change(fileInput, { target: { files: [file] } })

    // Submete o formulário
    const submitButton = screen.getByText('Criar Template')
    fireEvent.click(submitButton)

    // Verifica que o serviço foi chamado
    await waitFor(() => {
      expect(templateService.createTemplate).toHaveBeenCalled()
    })

    // Verifica toast de sucesso
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Template criado!',
      description: 'Seu template foi cadastrado com sucesso.',
    })

    // Verifica navegação após sucesso
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('deve lidar com erro ao criar template', async () => {
    vi.mocked(templateService.createTemplate).mockRejectedValue(new Error('API error'))

    render(
      <MemoryRouter>
        <CriarTemplate />
      </MemoryRouter>
    )

    // Preenche formulário
    const nameInput = screen.getByPlaceholderText('Ex: Contrato de Prestação de Serviços')
    fireEvent.change(nameInput, { target: { value: 'Template com Erro' } })

    const file = new File(['conteúdo'], 'test.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
    const fileInput = screen.getByLabelText('Arquivo do template')
    fireEvent.change(fileInput, { target: { files: [file] } })

    // Submete
    const submitButton = screen.getByText('Criar Template')
    fireEvent.click(submitButton)

    // Verifica toast de erro
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Erro ao criar template',
        description: 'Não foi possível cadastrar o template. Tente novamente.',
        variant: 'destructive',
      })
    })
  })

  it('deve navegar de volta ao clicar em voltar', () => {
    render(
      <MemoryRouter>
        <CriarTemplate />
      </MemoryRouter>
    )

    const backButton = screen.getByText('Voltar para início')
    fireEvent.click(backButton)

    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('deve exibir nome do arquivo selecionado', () => {
    render(
      <MemoryRouter>
        <CriarTemplate />
      </MemoryRouter>
    )

    const file = new File(['conteúdo'], 'meu-template.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
    const fileInput = screen.getByLabelText('Arquivo do template')
    fireEvent.change(fileInput, { target: { files: [file] } })

    expect(screen.getByText('meu-template.docx')).toBeInTheDocument()
  })

  it('deve mostrar loading durante upload', async () => {
    // Mock que demora para resolver
    vi.mocked(templateService.createTemplate).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        id: '1',
        title: 'Template',
        extension: '.docx',
        fieldsCount: 0,
        createdAt: '2024-01-01T10:00:00Z',
      }), 100))
    )

    render(
      <MemoryRouter>
        <CriarTemplate />
      </MemoryRouter>
    )

    // Preenche e submete
    const nameInput = screen.getByPlaceholderText('Ex: Contrato de Prestação de Serviços')
    fireEvent.change(nameInput, { target: { value: 'Template' } })

    const file = new File(['conteúdo'], 'test.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
    const fileInput = screen.getByLabelText('Arquivo do template')
    fireEvent.change(fileInput, { target: { files: [file] } })

    const submitButton = screen.getByText('Criar Template')
    fireEvent.click(submitButton)

    // Verifica que mostra "Enviando..."
    expect(screen.getByText('Enviando...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })
})