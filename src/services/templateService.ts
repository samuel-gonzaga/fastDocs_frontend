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

// Helper to map backend template object to frontend Template interface
function mapTemplateFromBackend(backendTemplate: any): Template {
  return {
    id: backendTemplate.id?.toString() ?? '',
    title: backendTemplate.name,
    extension: ".docx",
    fieldsCount: backendTemplate.placeholders?.length ?? 0,
    createdAt: backendTemplate.created_at,
  };
}

export const templateService = {
  // GET /templates/
  async listTemplates() {
    const response = await api.get('/templates/');

    // Handle different response structures:
    // 1. Direct array: [{...}, ...]
    // 2. Paginated: { results: [...] }
    // 3. Nested paginated: { data: { results: [...] } }
    let results = response.data;
    if (results && typeof results === 'object' && !Array.isArray(results)) {
      results = results.results ?? results.data?.results;
    }
    if (!Array.isArray(results)) {
      results = [];
    }

    return results.map(mapTemplateFromBackend);
  },

  // GET /templates/{id}/placeholders/
  async getTemplatePlaceholders(id: string): Promise<TemplateWithPlaceholders> {
    const response = await api.get(`/templates/${id}/placeholders/`);

    const data = response.data?.data ?? response.data;

    return {
      id,
      title: data.template ?? "",
      extension: ".docx",
      placeholders: (data.placeholders ?? []).map((p: any) => {
        if (typeof p === "string") {
          return {
            name: p,
            label: p.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
            type: "text",
          }
        }
        return {
          name: p.name ?? "",
          label: p.label ?? p.name ?? "",
          type: p.type ?? "text",
        }
      }),
    };
  },

  // POST /templates/
  async createTemplate(formData: FormData): Promise<Template> {
    const response = await api.post('/templates/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return mapTemplateFromBackend(response.data);
  },

  // POST /templates/{id}/generate/
  async generateDocument(id: string, data: GenerateDocumentPayload): Promise<Blob> {
    const response = await api.post(`/templates/${id}/generate/`, { data }, {
      responseType: 'blob',
    });
    console.log("GENERATE RESPONSE:", response);
    return response.data;
  },

  // DELETE /templates/{id}/
  async deleteTemplate(id: string): Promise<void> {
    await api.delete(`/templates/${id}/`);
  },
};
