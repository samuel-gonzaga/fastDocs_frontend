import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Clock, ArrowLeft, ArrowRight } from "lucide-react";
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

interface Event {
  id: string;
  title: string;
  date: string;
  category: "reuniao" | "pagamento" | "outro";
  description: string;
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
                        e.category === "reuniao"
                          ? "bg-primary/20 text-primary"
                          : e.category === "pagamento"
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

  const [month, setMonth] = useState(2);
  const [year, setYear] = useState(2024);

  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      title: "Reunião com cliente",
      date: "2024-03-20",
      category: "reuniao",
      description: "Discussão sobre novo contrato",
    },
    {
      id: "2",
      title: "Pagamento de honorários",
      date: "2024-03-25",
      category: "pagamento",
      description: "Processo 123/2024",
    },
    {
      id: "3",
      title: "Audiência",
      date: "2024-03-28",
      category: "outro",
      description: "Audiência de conciliação",
    },
  ]);

  const totalEvents = events.length;
  const pastEvents = events.filter((e) => new Date(e.date) < new Date()).length;
  const upcomingEvents = totalEvents - pastEvents;

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const filteredEvents = selectedCategory
    ? events.filter((e) => e.category === selectedCategory)
    : events;

  const [openCreate, setOpenCreate] = useState(false);
  const [newEventDate, setNewEventDate] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] =
    useState<"reuniao" | "pagamento" | "outro">("reuniao");

  const handleDayClick = (date: string) => {
    setNewEventDate(date);
    setOpenCreate(true);
  };

  const createEvent = () => {
    if (!newTitle.trim()) {
      toast({ title: "Preencha o título.", variant: "destructive" });
      return;
    }

    const newEvent: Event = {
      id: crypto.randomUUID(),
      title: newTitle,
      category: newCategory,
      description: newDescription,
      date: newEventDate,
    };

    setEvents((prev) => [...prev, newEvent]);
    setOpenCreate(false);

    setNewTitle("");
    setNewDescription("");
    setNewCategory("reuniao");

    toast({ title: "Evento criado!", description: newEventDate });
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
    c === "reuniao"
      ? "bg-primary text-primary-foreground"
      : c === "pagamento"
      ? "bg-green-500 text-white"
      : "bg-yellow-500 text-white";

  const getCategoryLabel = (c: string) =>
    c === "reuniao" ? "Reunião" : c === "pagamento" ? "Pagamento" : "Outro";

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
            onClick={() => setOpenCreate(true)}
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
                <p className="text-3xl font-bold">{totalEvents}</p>
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
                <p className="text-3xl font-bold">{pastEvents}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 flex justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Próximos</p>
                <p className="text-3xl font-bold">{upcomingEvents}</p>
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
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
          >
            Todos
          </Button>
          <Button
            variant={selectedCategory === "reuniao" ? "default" : "outline"}
            onClick={() => setSelectedCategory("reuniao")}
          >
            Reuniões
          </Button>
          <Button
            variant={selectedCategory === "pagamento" ? "default" : "outline"}
            onClick={() => setSelectedCategory("pagamento")}
          >
            Pagamentos
          </Button>
          <Button
            variant={selectedCategory === "outro" ? "default" : "outline"}
            onClick={() => setSelectedCategory("outro")}
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
                {filteredEvents.map((event) => (
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
                      {new Date(event.date).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                ))}
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
              <label className="text-sm font-medium">Data</label>
              <Input value={newEventDate} disabled className="mt-1" />
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
                <option value="reuniao">Reunião</option>
                <option value="pagamento">Pagamento</option>
                <option value="outro">Outro</option>
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
    </Layout>
  );
};

export default Calendario;
