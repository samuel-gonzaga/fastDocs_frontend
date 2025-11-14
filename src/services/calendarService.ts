import { api } from '@/lib/api';

export interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  category: 'reuniao' | 'pagamento' | 'outro';
  description: string;
}

export interface CalendarStats {
  total: number;
  past: number;
  upcoming: number;
}

export const calendarService = {
  // Listar eventos visíveis
  async listEvents(): Promise<CalendarEvent[]> {
    const response = await api.get('/calendar/');
    return response.data;
  },

  // Criar evento
  async createEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    const response = await api.post('/calendar/', event);
    return response.data;
  },

  // Detalhar evento
  async getEvent(id: number): Promise<CalendarEvent> {
    const response = await api.get(`/calendar/${id}/`);
    return response.data;
  },

  // Atualizar evento
  async updateEvent(id: number, event: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const response = await api.patch(`/calendar/${id}/`, event);
    return response.data;
  },

  // Deletar evento
  async deleteEvent(id: number): Promise<void> {
    await api.delete(`/calendar/${id}/`);
  },

  // Estatísticas
  async getStats(): Promise<CalendarStats> {
    const response = await api.get('/calendar/stats/');
    return response.data;
  },

  // Desbloquear evento "outro"
  async unlockEvent(id: number): Promise<CalendarEvent> {
    const response = await api.post(`/calendar/${id}/unlock/`);
    return response.data;
  },
};
