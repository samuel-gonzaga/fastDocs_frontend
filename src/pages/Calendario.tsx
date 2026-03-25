import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
/* CALENDAR GRID */

const CalendarioGrid = ({ year, month, events, onDayClick }: any) => {
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

          return (
            <div
              key={`${wi}-${di}`}
              onClick={() =>
                day !== 0 &&
                onDayClick(
                  `${year}-${String(month + 1).padStart(2, "0")}-${String(
                    day
                  ).padStart(2, "0")}`
                )
              }
              className={`
                min-h-20 p-1 border border-border rounded-md flex flex-col items-start gap-1 cursor-pointer
                transition hover:bg-muted/40
                ${day === 0 ? "bg-muted/20 cursor-default" : "bg-card"}
                ${isToday(day) ? "border-primary" : ""}
                ${isMobile ? "min-h-14 p-1" : "min-h-24 p-2"}
              `}
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
                        e.category === "meeting"
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

  const [openCreate, setOpenCreate] = useState(false);
  const [openDayEvents, setOpenDayEvents] = useState(false);
  const [selectedDayDate, setSelectedDayDate] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] =
    useState<"meeting" | "payment" | "other">("meeting");

  const handleDayClick = (date: string) => {
    setSelectedDayDate(date);
    setOpenDayEvents(true);
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

  const createEvent = async () => {
    if (!newTitle.trim()) {
      toast({ title: "Preencha o título.", variant: "destructive" });
      return;
    }

    try {
      const newEvent = await calendarService.createEvent({
        title: newTitle,
        category: newCategory,
        description: newDescription,
        date: newEventDate,
      });

      setEvents((prev) => [...prev, newEvent]);
      setOpenCreate(false);

      setNewTitle("");
      setNewDescription("");
      setNewCategory("meeting");

      toast({ title: "Evento criado!", description: newEventDate });
      loadStats();
    } catch (error) {
      toast({
        title: "Erro ao criar evento",
        description: "Não foi possível salvar o evento",
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

  const getCategoryLabel = (c: string) =>
    c === "meeting" ? "Meeting" : c === "payment" ? "Payment" : "Other";

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
            Meetings
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
            Payments
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
            Others
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

              <CardContent>
                <CalendarioGrid
                  year={year}
                  month={month}
                  events={filteredEvents}
                  onDayClick={handleDayClick}
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
                ) : filteredEvents.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum evento encontrado
                  </p>
                ) : (
                  filteredEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-4 border border-border rounded-lg hover:border-primary transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{event.title}</h4>
                        <Badge className={getCategoryColor(event.category)}>
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
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* MODAL CRIAR EVENTO */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Evento</DialogTitle>
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
                <option value="meeting">Meeting</option>
                <option value="payment">Payment</option>
                <option value="other">Other</option>
              </select>
            </div>

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
            <Button className="w-full" onClick={createEvent}>
              Criar
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
                      <h4 className="font-semibold mb-2 text-primary">Meetings</h4>
                      <div className="space-y-2">
                        {meetings.map(event => (
                          <div key={event.id} className="p-3 border border-border rounded-lg">
                            <div className="flex justify-between items-start">
                              <h5 className="font-medium">{event.title}</h5>
                              <Badge className="bg-primary text-primary-foreground">Meeting</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {payments.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-green-700">Payments</h4>
                      <div className="space-y-2">
                        {payments.map(event => (
                          <div key={event.id} className="p-3 border border-border rounded-lg">
                            <div className="flex justify-between items-start">
                              <h5 className="font-medium">{event.title}</h5>
                              <Badge className="bg-green-500 text-white">Payment</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {others.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-yellow-700">Others</h4>
                      <div className="space-y-2">
                        {others.map(event => (
                          <div key={event.id} className="p-3 border border-border rounded-lg">
                            <div className="flex justify-between items-start">
                              <h5 className="font-medium">{event.title}</h5>
                              <Badge className="bg-yellow-500 text-white">Other</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
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
    </Layout>
  );
};

export default Calendario;
