import { http, HttpResponse } from 'msw'

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1'

// Dados mockados para templates
const mockTemplates = [
  {
    id: '1',
    name: 'Contrato de Serviço',
    file_content: 'base64encoded',
    placeholders: ['cliente', 'data', 'valor', 'servico'],
    created_at: '2024-01-01T10:00:00Z',
  },
  {
    id: '2',
    name: 'Declaração de Comparecimento',
    file_content: 'base64encoded',
    placeholders: ['nome', 'data', 'horario', 'local'],
    created_at: '2024-01-02T11:30:00Z',
  },
  {
    id: '3',
    name: 'Orçamento',
    file_content: 'base64encoded',
    placeholders: ['empresa', 'descricao', 'valor_total', 'validade'],
    created_at: '2024-01-03T14:15:00Z',
  },
]

export const handlers = [
  // GET /templates/ - Listar templates
  http.get(`${API_BASE_URL}/templates/`, () => {
    return HttpResponse.json(mockTemplates)
  }),

  // GET /templates/:id/ - Obter template específico
  http.get(`${API_BASE_URL}/templates/:id/`, ({ params }) => {
    const { id } = params
    const template = mockTemplates.find(t => t.id === id)
    
    if (!template) {
      return new HttpResponse(null, { status: 404 })
    }
    
    return HttpResponse.json(template)
  }),

  // POST /templates/ - Criar template
  http.post(`${API_BASE_URL}/templates/`, async ({ request }) => {
    const formData = await request.formData()
    const name = formData.get('name') as string
    
    const newTemplate = {
      id: String(mockTemplates.length + 1),
      name,
      file_content: 'base64encoded',
      placeholders: [],
      created_at: new Date().toISOString(),
    }
    
    mockTemplates.push(newTemplate)
    
    return HttpResponse.json(newTemplate, { status: 201 })
  }),

  // GET /templates/:id/placeholders/ - Obter placeholders
  http.get(`${API_BASE_URL}/templates/:id/placeholders/`, ({ params }) => {
    const { id } = params
    const template = mockTemplates.find(t => t.id === id)
    
    if (!template) {
      return new HttpResponse(null, { status: 404 })
    }
    
    return HttpResponse.json({
      template: template.name,
      placeholders: template.placeholders,
    })
  }),

  // POST /templates/:id/generate/ - Gerar documento
  http.post(`${API_BASE_URL}/templates/:id/generate/`, async ({ params, request }) => {
    const { id } = params
    const template = mockTemplates.find(t => t.id === id)
    
    if (!template) {
      return new HttpResponse(null, { status: 404 })
    }
    
    // Cria um blob simulado de um arquivo .docx
    const blob = new Blob(['Mock DOCX content'], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    })
    
    return new HttpResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${template.name}.docx"`,
      },
    })
  }),

  // PUT /templates/:id/ - Atualizar template
  http.put(`${API_BASE_URL}/templates/:id/`, async ({ params, request }) => {
    const { id } = params
    const templateIndex = mockTemplates.findIndex(t => t.id === id)
    
    if (templateIndex === -1) {
      return new HttpResponse(null, { status: 404 })
    }
    
    const body = await request.json() as { name?: string }
    
    if (body.name) {
      mockTemplates[templateIndex].name = body.name
    }
    
    return HttpResponse.json(mockTemplates[templateIndex])
  }),

  // DELETE /templates/:id/ - Excluir template
  http.delete(`${API_BASE_URL}/templates/:id/`, ({ params }) => {
    const { id } = params
    const templateIndex = mockTemplates.findIndex(t => t.id === id)
    
    if (templateIndex === -1) {
      return new HttpResponse(null, { status: 404 })
    }
    
    mockTemplates.splice(templateIndex, 1)
    
    return new HttpResponse(null, { status: 204 })
  }),
]