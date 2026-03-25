import { api } from '@/lib/api';

export interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  time?: string;
  category: 'meeting' | 'payment' | 'other';
  description: string;
  password?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CalendarStats {
  total: number;
  past: number;
  upcoming: number;
}

// Helper function to extract data from wrapped API response
function extractData<T>(responseData: any): T {
  // Handle different response structures:
  // 1. Direct data: {id: 1, title: "..."}
  // 2. Wrapped success response: {success: true, data: {...}}
  // 3. Paginated wrapped: {success: true, data: {results: [...], count: X}}
  
  if (responseData && typeof responseData === 'object') {
    // Check if it's a wrapped response
    if ('success' in responseData && 'data' in responseData) {
      const data = responseData.data;
      // If data has 'results' field (paginated), return results
      if (data && typeof data === 'object' && 'results' in data) {
        return data.results;
      }
      // Otherwise return the data directly
      return data;
    }
    // Check if it's a paginated response without wrapper
    if ('results' in responseData) {
      return responseData.results;
    }
  }
  // Return as-is if no wrapper detected
  return responseData;
}

// Helper to extract pagination info from response
function extractPaginationInfo(responseData: any): { next: string | null, count: number } {
  if (responseData && typeof responseData === 'object') {
    if ('success' in responseData && 'data' in responseData) {
      const data = responseData.data;
      if (data && typeof data === 'object') {
        return {
          next: data.next || null,
          count: data.count || 0
        };
      }
    } else if ('next' in responseData) {
      return {
        next: responseData.next || null,
        count: responseData.count || 0
      };
    }
  }
  return { next: null, count: 0 };
}

export const calendarService = {
  // Listar eventos visíveis com suporte a paginação
  async listEvents(): Promise<CalendarEvent[]> {
    let allEvents: CalendarEvent[] = [];
    let url: string | null = '/calendar/';
    
    while (url) {
      const response = await api.get(url);
      const events = extractData<CalendarEvent[]>(response.data);
      
      if (Array.isArray(events)) {
        allEvents = [...allEvents, ...events];
      }
      
      // Check for next page
      const pagination = extractPaginationInfo(response.data);
      if (pagination.next) {
        const baseUrl = api.defaults.baseURL; // http://127.0.0.1:8000/api/v1
        const basePath = new URL(baseUrl).pathname; // /api/v1
        const nextUrl = new URL(pagination.next);
        const fullPath = nextUrl.pathname + nextUrl.search;
        // Remove basePath prefix
        const relativePath = fullPath.startsWith(basePath) ? fullPath.slice(basePath.length) : fullPath;
        url = relativePath;
      } else {
        url = null;
      }
    }
    
    return allEvents;
  },

  // Criar evento
  async createEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    const response = await api.post('/calendar/', event);
    return extractData<CalendarEvent>(response.data);
  },

  // Detalhar evento
  async getEvent(id: number): Promise<CalendarEvent> {
    const response = await api.get(`/calendar/${id}/`);
    return extractData<CalendarEvent>(response.data);
  },

  // Atualizar evento
  async updateEvent(id: number, event: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const response = await api.patch(`/calendar/${id}/`, event);
    return extractData<CalendarEvent>(response.data);
  },

  // Deletar evento
  async deleteEvent(id: number): Promise<void> {
    await api.delete(`/calendar/${id}/`);
  },

  // Estatísticas
  async getStats(): Promise<CalendarStats> {
    const response = await api.get('/calendar/stats/');
    return extractData<CalendarStats>(response.data);
  },

  // Desbloquear evento "outro"
  async unlockEvent(id: number): Promise<CalendarEvent> {
    const response = await api.post(`/calendar/${id}/unlock/`);
    return extractData<CalendarEvent>(response.data);
  },
};
