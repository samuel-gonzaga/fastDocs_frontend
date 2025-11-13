import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Event {
  id: string;
  title: string;
  date: string;
  category: "reuniao" | "pagamento" | "outro";
  description: string;
}

const Calendario = () => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const [events] = useState<Event[]>([
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "reuniao":
        return "bg-primary text-primary-foreground";
      case "pagamento":
        return "bg-success text-success-foreground";
      default:
        return "bg-warning text-warning-foreground";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "reuniao":
        return "Reunião";
      case "pagamento":
        return "Pagamento";
      default:
        return "Outro";
    }
  };

  const filteredEvents = selectedCategory
    ? events.filter((e) => e.category === selectedCategory)
    : events;

  const handleNewEvent = () => {
    toast({
      title: "Em desenvolvimento",
      description: "Funcionalidade de criar evento em breve.",
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Calendário</h1>
            <p className="text-muted-foreground">
              Gerencie seus eventos e prazos
            </p>
          </div>
          <Button onClick={handleNewEvent} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Novo Evento
          </Button>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total de eventos</p>
                  <p className="text-3xl font-bold text-foreground">{totalEvents}</p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Eventos passados</p>
                  <p className="text-3xl font-bold text-foreground">{pastEvents}</p>
                </div>
                <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Próximos eventos</p>
                  <p className="text-3xl font-bold text-foreground">{upcomingEvents}</p>
                </div>
                <div className="h-12 w-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex gap-3 mb-6">
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

        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendário visual */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Março 2024
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted/30 rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Calendário interativo em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de eventos */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Eventos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-4 border border-border rounded-lg hover:border-primary transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-card-foreground">
                          {event.title}
                        </h4>
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
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Calendario;
