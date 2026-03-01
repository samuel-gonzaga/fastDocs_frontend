import { describe, it, expect, vi, beforeEach } from 'vitest'
import { templateService } from './templateService'
import { api } from '@/lib/api'

// Mock do axios
vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

describe('templateService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('listTemplates', () => {
    it('deve listar templates com sucesso', async () => {
      const mockResponse = {
        data: [
          {
            id: 1,
            name: 'Contrato de Serviço',
            placeholders: ['cliente', 'data', 'valor'],
            created_at: '2024-01-01T10:00:00Z',
          },
          {
            id: 2,
            name: 'Declaração',
            placeholders: ['nome', 'data'],
            created_at: '2024-01-02T11:30:00Z',
          },
        ],
      }

      vi.mocked(api.get).mockResolvedValue(mockResponse)

      const result = await templateService.listTemplates()

      expect(api.get).toHaveBeenCalledWith('/templates/')
      expect(result).toEqual([
        {
          id: '1',
          title: 'Contrato de Serviço',
          extension: '.docx',
          fieldsCount: 3,
          createdAt: '2024-01-01T10:00:00Z',
        },
        {
          id: '2',
          title: 'Declaração',
          extension: '.docx',
          fieldsCount: 2,
          createdAt: '2024-01-02T11:30:00Z',
        },
      ])
    })

    it('deve lidar com resposta paginada', async () => {
      const mockResponse = {
        data: {
          results: [
            {
              id: 1,
              name: 'Template 1',
              placeholders: ['field1'],
              created_at: '2024-01-01T10:00:00Z',
            },
          ],
        },
      }

      vi.mocked(api.get).mockResolvedValue(mockResponse)

      const result = await templateService.listTemplates()

      expect(result).toEqual([
        {
          id: '1',
          title: 'Template 1',
          extension: '.docx',
          fieldsCount: 1,
          createdAt: '2024-01-01T10:00:00Z',
        },
      ])
    })

    it('deve lidar com resposta com estrutura data.results', async () => {
      const mockResponse = {
        data: {
          data: {
            results: [
              {
                id: 1,
                name: 'Template 1',
                placeholders: ['field1'],
                created_at: '2024-01-01T10:00:00Z',
              },
            ],
          },
        },
      }

      vi.mocked(api.get).mockResolvedValue(mockResponse)

      const result = await templateService.listTemplates()

      expect(result).toEqual([
        {
          id: '1',
          title: 'Template 1',
          extension: '.docx',
          fieldsCount: 1,
          createdAt: '2024-01-01T10:00:00Z',
        },
      ])
    })

    it('deve lidar com resposta vazia', async () => {
      const mockResponse = {
        data: [],
      }

      vi.mocked(api.get).mockResolvedValue(mockResponse)

      const result = await templateService.listTemplates()

      expect(result).toEqual([])
    })

    it('deve lidar com erro na API', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Network error'))

      await expect(templateService.listTemplates()).rejects.toThrow('Network error')
    })
  })

  describe('getTemplatePlaceholders', () => {
    it('deve obter placeholders com sucesso', async () => {
      const mockResponse = {
        data: {
          template: 'Contrato de Serviço',
          placeholders: ['cliente', 'data', 'valor'],
        },
      }

      vi.mocked(api.get).mockResolvedValue(mockResponse)

      const result = await templateService.getTemplatePlaceholders('1')

      expect(api.get).toHaveBeenCalledWith('/templates/1/placeholders/')
      expect(result).toEqual({
        id: '1',
        title: 'Contrato de Serviço',
        extension: '.docx',
        placeholders: [
          {
            name: 'cliente',
            label: 'Cliente',
            type: 'text',
          },
          {
            name: 'data',
            label: 'Data',
            type: 'text',
          },
          {
            name: 'valor',
            label: 'Valor',
            type: 'text',
          },
        ],
      })
    })

    it('deve lidar com placeholders como objetos', async () => {
      const mockResponse = {
        data: {
          template: 'Template Complexo',
          placeholders: [
            { name: 'nome', label: 'Nome Completo', type: 'text' },
            { name: 'data_nascimento', label: 'Data de Nascimento', type: 'date' },
          ],
        },
      }

      vi.mocked(api.get).mockResolvedValue(mockResponse)

      const result = await templateService.getTemplatePlaceholders('2')

      expect(result.placeholders).toEqual([
        {
          name: 'nome',
          label: 'Nome Completo',
          type: 'text',
        },
        {
          name: 'data_nascimento',
          label: 'Data de Nascimento',
          type: 'date',
        },
      ])
    })

    it('deve lidar com resposta vazia', async () => {
      const mockResponse = {
        data: {
          template: '',
          placeholders: [],
        },
      }

      vi.mocked(api.get).mockResolvedValue(mockResponse)

      const result = await templateService.getTemplatePlaceholders('3')

      expect(result).toEqual({
        id: '3',
        title: '',
        extension: '.docx',
        placeholders: [],
      })
    })

    it('deve lidar com resposta com data.data', async () => {
      const mockResponse = {
        data: {
          data: {
            template: 'Template',
            placeholders: ['field1'],
          },
        },
      }

      vi.mocked(api.get).mockResolvedValue(mockResponse)

      const result = await templateService.getTemplatePlaceholders('4')

      expect(result.title).toBe('Template')
      expect(result.placeholders).toHaveLength(1)
    })

    it('deve lidar com erro na API', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Not found'))

      await expect(templateService.getTemplatePlaceholders('999')).rejects.toThrow('Not found')
    })
  })

  describe('createTemplate', () => {
    it('deve criar template com sucesso', async () => {
      const mockFormData = new FormData()
      mockFormData.append('name', 'Novo Template')
      mockFormData.append('file', new Blob(['content']))

      const mockResponse = {
        data: {
          id: '10',
          name: 'Novo Template',
          placeholders: [],
          created_at: '2024-01-01T10:00:00Z',
        },
      }

      vi.mocked(api.post).mockResolvedValue(mockResponse)

      const result = await templateService.createTemplate(mockFormData)

      expect(api.post).toHaveBeenCalledWith('/templates/', mockFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      expect(result).toEqual({
        id: '10',
        title: 'Novo Template',
        extension: '.docx',
        fieldsCount: 0,
        createdAt: '2024-01-01T10:00:00Z',
      })
    })

    it('deve lidar com erro na criação', async () => {
      const mockFormData = new FormData()
      vi.mocked(api.post).mockRejectedValue(new Error('Validation error'))

      await expect(templateService.createTemplate(mockFormData)).rejects.toThrow('Validation error')
    })
  })

  describe('generateDocument', () => {
    it('deve gerar documento com sucesso', async () => {
      const mockBlob = new Blob(['document content'], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })

      const mockResponse = {
        data: mockBlob,
      }

      vi.mocked(api.post).mockResolvedValue(mockResponse)

      const formData = {
        nome: 'João Silva',
        data: '2024-01-01',
      }

      const result = await templateService.generateDocument('1', formData)

      expect(api.post).toHaveBeenCalledWith(
        '/templates/1/generate/',
        { data: formData },
        {
          responseType: 'blob',
        }
      )
      expect(result).toBeInstanceOf(Blob)
      expect(result.type).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    })

    it('deve lidar com erro na geração', async () => {
      vi.mocked(api.post).mockRejectedValue(new Error('Generation failed'))

      await expect(
        templateService.generateDocument('1', { field: 'value' })
      ).rejects.toThrow('Generation failed')
    })

    it('deve lidar com resposta de erro como blob', async () => {
      const errorBlob = new Blob(['Error message'], { type: 'text/plain' })
      const mockResponse = {
        data: errorBlob,
      }

      vi.mocked(api.post).mockResolvedValue(mockResponse)

      const result = await templateService.generateDocument('1', { field: 'value' })

      // Ainda retorna o blob, mesmo que seja um erro
      expect(result).toBeInstanceOf(Blob)
      expect(result.type).toBe('text/plain')
    })
  })

  describe('transformação de dados', () => {
    it('deve transformar string placeholders corretamente', () => {
      // Testa a lógica de transformação interna
      const placeholderString = 'nome_completo'
      const expectedLabel = 'Nome Completo'

      // Simula o que o serviço faz
      const transformed = placeholderString.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      
      expect(transformed).toBe(expectedLabel)
    })

    it('deve lidar com placeholders vazios', () => {
      const emptyString = ''
      const transformed = emptyString.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      
      expect(transformed).toBe('')
    })

    it('deve lidar com placeholders já formatados', () => {
      const alreadyFormatted = 'Nome Completo'
      const transformed = alreadyFormatted.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      
      expect(transformed).toBe('Nome Completo')
    })
  })
})