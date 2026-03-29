import { useState, useEffect, useRef, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar, Plus, Clock, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { calendarService, CalendarEvent } from "@/services/calendarService";

interface Event {
  id: number;
  title: string;
  date: string;
  time?: string;
  category: "meeting" | "payment" | "other";
  description: string;
  password?: string;
  created_at?: string;
  updated_at?: string;
}

const isPastEvent = (eventDateStr: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Parse YYYY-MM-DD as local date (same as formatDate)
  const parts = eventDateStr.split('-');
  if (parts.length !== 3) {
    // Fallback to Date parsing if format unexpected
    const eventDate = new Date(eventDateStr);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate < today;
  }
  
  const [year, month, day] = parts.map(Number);
  const eventDate = new Date(year, month - 1, day);
  // eventDate is already local midnight
  
  return eventDate < today;
};

/* CALENDAR GRID */

interface CalendarioGridProps {
  year: number;
  month: number;
  events: Event[];
  onDayClick: (date: string) => void;
  selectedDate: string | null;
  registerDayRef: (date: string, element: HTMLDivElement | null) => void;
}

const CalendarioGrid = ({
  year,
  month,
  events,
  onDayClick,
  selectedDate,
  registerDayRef
}: CalendarioGridProps) => {
  const isMobile = useIsMobile();
  const today = new Date();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const weeks: number[][] = [];
  let currentWeek: number[] = [];

  for (let i = 0; i < firstDay.getDay(); i++) currentWeek.push(0);

  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(0);
    weeks.push(currentWeek);
  }

  const getEventsByDay = (day: number) => {
    if (day === 0) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    return events.filter((e: Event) => e.date === dateStr);
  };

  const isToday = (day: number) =>
    day === today.getDate() &&
    today.getMonth() === month &&
    today.getFullYear() === year;

  return (
    <div
      className={`
        w-full 
        grid 
        ${isMobile ? "grid-cols-7 gap-1 text-[10px]" : "grid-cols-7 text-sm gap-2"}
        select-none
      `}
    >
      {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
        <div
          key={d}
          className={`py-2 font-medium text-muted-foreground 
            ${isMobile ? "text-[9px]" : ""}
          `}
        >
          {d}
        </div>
      ))}

      {weeks.map((week, wi) =>
        week.map((day, di) => {
          const dayEvents = getEventsByDay(day);

          const dateStr = day !== 0
            ? `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
            : "";
          const isSelected = selectedDate === dateStr;

          return (
            <div
              key={`${wi}-${di}`}
              ref={(el) => day !== 0 && registerDayRef(dateStr, el)}
              onClick={() =>
                day !== 0 &&
                onDayClick(dateStr)
              }
              className={`
                min-h-20 p-1 border border-border rounded-md flex flex-col items-start gap-1 cursor-pointer
                transition hover:bg-muted/40
                ${day === 0 ? "bg-muted/20 cursor-default" : "bg-card"}
                ${isToday(day) ? "border-primary" : ""}
                ${isSelected ? "border-primary border-2 bg-primary/10" : ""}
                ${isMobile ? "min-h-14 p-1" : "min-h-24 p-2"}
              `}
              role="button"
              tabIndex={day !== 0 ? 0 : -1}
              aria-selected={isSelected}
              aria-label={day !== 0 ? `Dia ${day}, ${dateStr}` : "Dia vazio"}
            >
              {day !== 0 && (
                <span
                  className={`font-semibold 
                    ${isMobile ? "text-[10px]" : "text-xs"}
                    ${isToday(day) ? "text-primary" : "text-foreground"}
                  `}
                >
                  {day}
                </span>
              )}

              <div className="flex flex-col gap-1 w-full">
                {dayEvents.map((e) => (
                  <span
                    key={e.id}
                    className={`
                      truncate rounded-md px-1.5 py-0.5
                      ${isMobile ? "text-[8px]" : "text-[10px]"}
                      ${
                        isPastEvent(e.date)
                          ? "bg-gray-300 text-gray-600"
                          : e.category === "meeting"
                          ? "bg-primary/20 text-primary"
                          : e.category === "payment"
                          ? "bg-green-500/20 text-green-700"
                          : "bg-yellow-500/20 text-yellow-700"
                      }
                    `}
                  >
                    {e.title}
                  </span>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};


/* COMPONENTE */


const Calendario = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, past: 0, upcoming: 0 });

  // Carregar eventos da API
  useEffect(() => {
    loadEvents();
    loadStats();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await calendarService.listEvents();

      // BACKEND RETORNA LISTA DIRETA, ENTÃO:
      setEvents(Array.isArray(data) ? data : []); 
    } catch (error) {
      toast({
        title: "Erro ao carregar eventos",
        description: "Não foi possível conectar com a API",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await calendarService.getStats();
      setStats(data);
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  };

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const safeEvents = Array.isArray(events) ? events : [];
  console.log("events:", events);
  const filteredEvents = selectedCategories.length > 0
    ? events.filter((e) => selectedCategories.includes(e.category))
    : events;

  const sidebarEvents = filteredEvents.filter(e => !isPastEvent(e.date));

  // Two-way highlighting state
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  // Refs for scrolling and element references
  const calendarContainerRef = useRef<HTMLDivElement>(null);
  const eventListContainerRef = useRef<HTMLDivElement>(null);
  const dayRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const eventRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const [openCreate, setOpenCreate] = useState(false);
  const [openDayEvents, setOpenDayEvents] = useState(false);
  const [selectedDayDate, setSelectedDayDate] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] =
    useState<"meeting" | "payment" | "other">("meeting");
  const [newPassword, setNewPassword] = useState("");

  // Edit/Delete state
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<number | null>(null);

  // Clear password when category changes away from 'other'
  useEffect(() => {
    if (newCategory !== 'other') {
      setNewPassword("");
    }
  }, [newCategory]);

  // Ref registration functions
  const registerDayRef = useCallback((date: string, element: HTMLDivElement | null) => {
    if (element) {
      dayRefs.current.set(date, element);
    } else {
      dayRefs.current.delete(date);
    }
  }, []);

  const registerEventRef = useCallback((eventId: number, element: HTMLDivElement | null) => {
    if (element) {
      eventRefs.current.set(eventId, element);
    } else {
      eventRefs.current.delete(eventId);
    }
  }, []);

  // Scroll functions
  const scrollToDay = useCallback((date: string) => {
    const dayElement = dayRefs.current.get(date);
    if (dayElement) {
      dayElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      });
    }
  }, []);

  const scrollToEvent = useCallback((eventId: number) => {
    const eventElement = eventRefs.current.get(eventId);
    if (eventElement) {
      eventElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, []);

  // Handle event click from sidebar
  const handleEventClick = useCallback((event: Event) => {
    setSelectedEventId(event.id);
    setSelectedDate(event.date);
    setOpenDayEvents(false); // Close any open day modal
    
    // Check if event is in current month/year
    const eventDate = new Date(event.date);
    const eventYear = eventDate.getFullYear();
    const eventMonth = eventDate.getMonth();
    
    if (eventYear !== year || eventMonth !== month) {
      // Update calendar to show the event's month
      setYear(eventYear);
      setMonth(eventMonth);
      // Scroll after re-render
      setTimeout(() => {
        scrollToDay(event.date);
      }, 100);
    } else {
      // Scroll immediately
      scrollToDay(event.date);
    }
  }, [year, month, scrollToDay]);

  const handleDayClick = (date: string) => {
    setSelectedDayDate(date);
    setOpenDayEvents(true);
    // Set selected date for highlighting
    setSelectedDate(date);
    
    // Find first event for this date
    const eventsForDate = filteredEvents.filter((e) => e.date === date);
    if (eventsForDate.length > 0) {
      const firstEvent = eventsForDate[0];
      setSelectedEventId(firstEvent.id);
      scrollToEvent(firstEvent.id);
    } else {
      setSelectedEventId(null);
    }
  };

  const handleOpenCreate = () => {
    // Set default date to tomorrow when opening via button
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    // Format as YYYY-MM-DD in local time
    const tomorrowYear = tomorrow.getFullYear();
    const tomorrowMonth = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const tomorrowDay = String(tomorrow.getDate()).padStart(2, '0');
    const tomorrowStr = `${tomorrowYear}-${tomorrowMonth}-${tomorrowDay}`;
    setNewEventDate(tomorrowStr);
    setOpenCreate(true);
  };

  const handleCreateEventForDay = (date: string) => {
    setNewEventDate(date);
    setOpenDayEvents(false);
    setOpenCreate(true);
  };

  const saveEvent = async () => {
    if (!newTitle.trim()) {
      toast({ title: "Preencha o título.", variant: "destructive" });
      return;
    }

    // Validate password for 'other' category
    if (newCategory === 'other' && !newPassword.trim()) {
      toast({ title: "Preencha a senha para eventos 'Outro'.", variant: "destructive" });
      return;
    }

    console.log(`${editingEvent ? 'Updating' : 'Creating'} event...`, {
      title: newTitle,
      category: newCategory,
      date: newEventDate,
      descriptionLength: newDescription.length,
    });

    try {
      if (editingEvent) {
        // Update existing event
        const updatedEvent = await calendarService.updateEvent(editingEvent.id, {
          title: newTitle,
          category: newCategory,
          description: newDescription,
          date: newEventDate,
          ...(newCategory === 'other' && { password: newPassword })
        });

        console.log('Event updated successfully:', updatedEvent);
        setEvents((prev) => prev.map(e => e.id === editingEvent.id ? updatedEvent : e));
        setOpenCreate(false);
        setEditingEvent(null);
        
        toast({ title: "Evento atualizado!", description: newEventDate });
      } else {
        // Create new event
        const newEvent = await calendarService.createEvent({
          title: newTitle,
          category: newCategory,
          description: newDescription,
          date: newEventDate,
          ...(newCategory === 'other' && { password: newPassword })
        });

        console.log('Event created successfully:', newEvent);
        setEvents((prev) => [...prev, newEvent]);
        setOpenCreate(false);

        setNewTitle("");
        setNewDescription("");
        setNewCategory("meeting");
        setNewPassword("");

        toast({ title: "Evento criado!", description: newEventDate });
      }
      
      loadStats();
    } catch (error: any) {
      console.error(`Error ${editingEvent ? 'updating' : 'creating'} event:`, error);
      
      let errorTitle = editingEvent ? "Erro ao atualizar evento" : "Erro ao criar evento";
      let errorDescription = "Não foi possível salvar o evento.";
      
      // Enhanced error diagnostics
      if (error.name === 'AxiosError' || error.isAxiosError) {
        console.error('Axios error details for save event:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url,
          method: error.config?.method,
        });
        
        if (error.response) {
          const status = error.response.status;
          if (status === 400) {
            errorDescription = "Dados inválidos. Verifique as informações do evento.";
            // Try to extract validation errors from response
            if (error.response.data) {
              const validationErrors = Object.values(error.response.data).flat();
              if (validationErrors.length > 0) {
                errorDescription = `Erro de validação: ${validationErrors.join(', ')}`;
              }
            }
          } else if (status === 404) {
            errorDescription = "Evento não encontrado. Pode ter sido excluído.";
          } else if (status === 403) {
            errorDescription = "Permissão negada para modificar eventos.";
          } else if (status === 500) {
            errorDescription = "Erro interno do servidor. Tente novamente mais tarde.";
          }
        } else if (error.code === 'ECONNABORTED') {
          errorDescription = "Tempo limite da conexão excedido.";
        } else if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
          errorDescription = "Falha na conexão de rede. Verifique sua internet.";
        }
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      });
    }
  };

  // Edit handler
  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setNewEventDate(event.date);
    setNewTitle(event.title);
    setNewDescription(event.description || '');
    setNewCategory(event.category);
    // Set password if event has one (for 'other' category)
    if (event.category === 'other' && event.password) {
      setNewPassword(event.password);
    } else {
      setNewPassword('');
    }
    setOpenCreate(true);
  };

  // Delete handlers
  const handleDelete = (id: number) => {
    setEventToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;
    
    console.log('Deleting event ID:', eventToDelete);
    
    try {
      await calendarService.deleteEvent(eventToDelete);
      console.log('Event deleted successfully');
      setEvents(prev => prev.filter(e => e.id !== eventToDelete));
      setDeleteDialogOpen(false);
      setEventToDelete(null);
      loadStats();
      toast({ title: "Evento excluído!" });
    } catch (error: any) {
      console.error('Error deleting event:', error);
      
      let errorDescription = "Não foi possível excluir o evento.";
      
      // Enhanced error diagnostics
      if (error.name === 'AxiosError' || error.isAxiosError) {
        console.error('Axios error details for delete event:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url,
          method: error.config?.method,
        });
        
        if (error.response) {
          const status = error.response.status;
          if (status === 404) {
            errorDescription = "Evento não encontrado. Pode já ter sido excluído.";
          } else if (status === 403) {
            errorDescription = "Permissão negada para excluir eventos.";
          } else if (status === 500) {
            errorDescription = "Erro interno do servidor. Tente novamente mais tarde.";
          } else if (status === 400) {
            errorDescription = "Não é possível excluir este evento.";
          }
        } else if (error.code === 'ECONNABORTED') {
          errorDescription = "Tempo limite da conexão excedido.";
        } else if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
          errorDescription = "Falha na conexão de rede. Verifique sua internet.";
        }
      }
      
      toast({
        title: "Erro ao excluir evento",
        description: errorDescription,
        variant: "destructive",
      });
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const getCategoryColor = (c: string) =>
    c === "meeting"
      ? "bg-primary text-primary-foreground"
      : c === "payment"
      ? "bg-green-500 text-white"
      : "bg-yellow-500 text-white";

  const getEventColor = (event: Event) => {
    if (isPastEvent(event.date)) {
      return "bg-gray-300 text-gray-600";
    }
    return getCategoryColor(event.category);
  };

  const getCategoryLabel = (c: string) =>
    c === "meeting" ? "Reunião" : c === "payment" ? "Pagamento" : "Outro";

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Data inválida";
    
    // Parse YYYY-MM-DD format correctly in local timezone
    const parts = dateStr.split('-');
    if (parts.length !== 3) {
      // Try parsing as ISO string
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "Data inválida";
      return date.toLocaleDateString("pt-BR");
    }
    
    const [year, month, day] = parts.map(Number);
    // Create date in local timezone (month is 0-indexed)
    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) return "Data inválida";
    return date.toLocaleDateString("pt-BR");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 py-6">
        {/* HEADER */}
        <div
          className={`flex items-center justify-between mb-8 ${
            isMobile ? "flex-col gap-4 text-center" : ""
          }`}
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Calendário
            </h1>
            <p className="text-muted-foreground">
              Gerencie seus eventos e prazos
            </p>
          </div>

          <Button
            size={isMobile ? "default" : "lg"}
            className={isMobile ? "w-full" : ""}
            onClick={handleOpenCreate}
          >
            <Plus className="h-5 w-5 mr-2" />
            Novo Evento
          </Button>
        </div>

        {/* CARDS – viram 1 coluna no mobile */}
        <div
          className={`grid gap-6 mb-8 ${
            isMobile ? "grid-cols-1" : "md:grid-cols-3"
          }`}
        >
          <Card>
            <CardContent className="pt-6 flex justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total</p>
                <p className="text-3xl font-bold">{loading ? <Loader2 className="h-8 w-8 animate-spin" /> : stats.total}</p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 flex justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Passados</p>
                <p className="text-3xl font-bold">{loading ? <Loader2 className="h-8 w-8 animate-spin" /> : stats.past}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 flex justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Próximos</p>
                <p className="text-3xl font-bold">{loading ? <Loader2 className="h-8 w-8 animate-spin" /> : stats.upcoming}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FILTROS – scroll horizontal no mobile */}
        <div
          className={`
            flex gap-3 mb-6
            ${isMobile ? "overflow-x-auto no-scrollbar pb-2" : ""}
          `}
        >
          <Button
            variant={selectedCategories.length === 0 ? "default" : "outline"}
            onClick={() => setSelectedCategories([])}
          >
            Todos
          </Button>
          <Button
            variant={selectedCategories.includes("meeting") ? "default" : "outline"}
            onClick={() => {
              const newCategories = selectedCategories.includes("meeting")
                ? selectedCategories.filter(c => c !== "meeting")
                : [...selectedCategories, "meeting"];
              setSelectedCategories(newCategories);
            }}
          >
            Reuniões
          </Button>
          <Button
            variant={selectedCategories.includes("payment") ? "default" : "outline"}
            onClick={() => {
              const newCategories = selectedCategories.includes("payment")
                ? selectedCategories.filter(c => c !== "payment")
                : [...selectedCategories, "payment"];
              setSelectedCategories(newCategories);
            }}
          >
            Pagamentos
          </Button>
          <Button
            variant={selectedCategories.includes("other") ? "default" : "outline"}
            onClick={() => {
              const newCategories = selectedCategories.includes("other")
                ? selectedCategories.filter(c => c !== "other")
                : [...selectedCategories, "other"];
              setSelectedCategories(newCategories);
            }}
          >
            Outros
          </Button>
        </div>

        {/* GRID PRINCIPAL – mobile vira 1 coluna */}
        <div className={`grid gap-8 ${isMobile ? "grid-cols-1" : "lg:grid-cols-3"}`}>
          
          {/* CALENDÁRIO */}
          <div className={isMobile ? "" : "lg:col-span-2"}>
            <Card>
              <CardHeader
                className={`flex items-center justify-between ${
                  isMobile ? "flex-col text-center gap-4" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <CardTitle>
                    {new Date(year, month).toLocaleString("pt-BR", {
                      month: "long",
                      year: "numeric",
                    })}
                  </CardTitle>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size={isMobile ? "default" : "icon"} onClick={prevMonth}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size={isMobile ? "default" : "icon"} onClick={nextMonth}>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent ref={calendarContainerRef}>
                <CalendarioGrid
                  year={year}
                  month={month}
                  events={filteredEvents}
                  onDayClick={handleDayClick}
                  selectedDate={selectedDate}
                  registerDayRef={registerDayRef}
                />
              </CardContent>
            </Card>
          </div>

          {/* LISTA DE EVENTOS – vai para baixo no mobile */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Eventos
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : sidebarEvents.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum evento encontrado
                  </p>
                ) : (
                  sidebarEvents.map((event) => {
                    const isSelected = selectedEventId === event.id;
                    return (
                      <div
                        key={event.id}
                        ref={(el) => registerEventRef(event.id, el)}
                        onClick={() => handleEventClick(event)}
                        className={`
                          p-4 border border-border rounded-lg transition-colors cursor-pointer
                          hover:border-primary
                          ${isSelected ? "border-primary border-2 bg-primary/5" : ""}
                          ${isPastEvent(event.date) ? "opacity-60 bg-gray-50" : ""}
                        `}
                        role="button"
                        tabIndex={0}
                        aria-selected={isSelected}
                        aria-label={`Evento: ${event.title}, ${formatDate(event.date)}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleEventClick(event);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold">{event.title}</h4>
                          <Badge className={getEventColor(event)}>
                            {getCategoryLabel(event.category)}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground mb-2">
                          {event.description}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {formatDate(event.date)}
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* MODAL CRIAR/EDITAR EVENTO */}
      <Dialog open={openCreate} onOpenChange={(open) => {
        if (!open) {
          setEditingEvent(null);
          setNewTitle("");
          setNewDescription("");
          setNewCategory("meeting");
          setNewPassword("");
        }
        setOpenCreate(open);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Editar Evento" : "Criar Evento"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Data (YYYY-MM-DD)</label>
              <Input
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
                placeholder="2026-03-15"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Título</label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Categoria</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="mt-1 w-full border rounded-lg p-2 bg-background"
              >
                <option value="meeting">Reunião</option>
                <option value="payment">Pagamento</option>
                <option value="other">Outro</option>
              </select>
            </div>

            {newCategory === 'other' && (
              <div>
                <label className="text-sm font-medium">Senha</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite uma senha para o evento"
                  className="mt-1"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Descrição</label>
              <Textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button className="w-full" onClick={saveEvent}>
              {editingEvent ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL EVENTOS DO DIA */}
      <Dialog open={openDayEvents} onOpenChange={setOpenDayEvents}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Eventos do dia {selectedDayDate && formatDate(selectedDayDate)}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedDayDate && (() => {
              const dayEvents = events.filter((e: Event) => e.date === selectedDayDate);
              const meetings = dayEvents.filter(e => e.category === 'meeting');
              const payments = dayEvents.filter(e => e.category === 'payment');
              const others = dayEvents.filter(e => e.category === 'other');
              
              return (
                <>
                  {meetings.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-primary">Reuniões</h4>
                      <div className="space-y-2">
                        {meetings.map(event => (
                          <div key={event.id} className="p-3 border border-border rounded-lg">
                            <div className="flex justify-between items-start">
                              <h5 className="font-medium">{event.title}</h5>
                              <Badge className="bg-primary text-primary-foreground">Reunião</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Button variant="outline" size="sm" onClick={() => handleEdit(event)}>
                                Editar
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDelete(event.id)}>
                                Excluir
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {payments.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-green-700">Pagamentos</h4>
                      <div className="space-y-2">
                        {payments.map(event => (
                          <div key={event.id} className="p-3 border border-border rounded-lg">
                            <div className="flex justify-between items-start">
                              <h5 className="font-medium">{event.title}</h5>
                              <Badge className="bg-green-500 text-white">Pagamento</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Button variant="outline" size="sm" onClick={() => handleEdit(event)}>
                                Editar
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDelete(event.id)}>
                                Excluir
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {others.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-yellow-700">Outros</h4>
                      <div className="space-y-2">
                        {others.map(event => (
                          <div key={event.id} className="p-3 border border-border rounded-lg">
                            <div className="flex justify-between items-start">
                              <h5 className="font-medium">{event.title}</h5>
                              <Badge className="bg-yellow-500 text-white">Outro</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Button variant="outline" size="sm" onClick={() => handleEdit(event)}>
                                Editar
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDelete(event.id)}>
                                Excluir
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {dayEvents.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      Nenhum evento para este dia.
                    </p>
                  )}
                </>
              );
            })()}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setOpenDayEvents(false)}
              className="w-full sm:w-auto"
            >
              Fechar
            </Button>
            <Button
              onClick={() => handleCreateEventForDay(selectedDayDate)}
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Evento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Evento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Calendario;
