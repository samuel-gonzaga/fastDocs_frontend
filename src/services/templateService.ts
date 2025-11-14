import { api } from '@/lib/api';

export interface Template {
  id: string;
  title: string;
  extension: string;
  fieldsCount: number;
  createdAt: string;
}

export interface Placeholder {
  name: string;
  label: string;
  type: string;
}

export interface TemplateWithPlaceholders {
  id: string;
  title: string;
  extension: string;
  placeholders: Placeholder[];
}

export interface GenerateDocumentPayload {
  [key: string]: string;
}

export const templateService = {
  // GET /templates/
  async listTemplates(): Promise<Template[]> {
    const response = await api.get('/templates/');

    const results = response.data?.data?.results ?? [];

    return results.map((t: any) => ({
      id: t.id,
      title: t.name,
      extension: t.extension ?? ".docx",
      fieldsCount: t.placeholders?.length ?? 0,
      createdAt: t.created_at,
    }));
  },

  // GET /templates/{id}/placeholders/
  async getTemplatePlaceholders(id: string): Promise<TemplateWithPlaceholders> {
    const response = await api.get(`/templates/${id}/placeholders/`);

    const raw = response.data;

    return {
      id,
      title: raw.template,
      extension: ".docx", // pode ajustar se quiser
      placeholders: raw.placeholders ?? [],
    };
  },

  // POST /templates/
  async createTemplate(formData: FormData): Promise<Template> {
    const response = await api.post('/templates/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // POST /templates/{id}/generate/
  async generateDocument(id: string, data: GenerateDocumentPayload): Promise<Blob> {
    const response = await api.post(`/templates/${id}/generate/`, data, {
      responseType: 'blob',
    });
    return response.data;
  },
};
