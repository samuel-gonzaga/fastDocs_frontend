import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { TemplateCard } from "@/components/TemplateCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface Template {
  id: string;
  title: string;
  extension: string;
  fieldsCount: number;
  createdAt: string;
}

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [templates, setTemplates] = useState<Template[]>([
    {
      id: "1",
      title: "Contrato de Prestação de Serviços",
      extension: ".docx",
      fieldsCount: 8,
      createdAt: "15/03/2024",
    },
    {
      id: "2",
      title: "Procuração",
      extension: ".docx",
      fieldsCount: 5,
      createdAt: "10/03/2024",
    },
    {
      id: "3",
      title: "Petição Inicial",
      extension: ".docx",
      fieldsCount: 12,
      createdAt: "05/03/2024",
    },
  ]);

  const handleFill = (id: string) => {
    navigate(`/preencher/${id}`);
  };

  const handleDelete = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    toast({
      title: "Template excluído",
      description: "O template foi removido com sucesso.",
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 md:px-6 md:py-8">

        {/* Header responsivo */}
        <div
          className={`flex justify-between mb-8 ${
            isMobile ? "flex-col gap-4" : "items-center"
          }`}
        >
          <div>
            <h1
              className={`font-bold text-foreground mb-1 ${
                isMobile ? "text-2xl" : "text-3xl"
              }`}
            >
              Templates disponíveis
            </h1>

            <p className="text-muted-foreground text-sm md:text-base">
              Gerencie e preencha seus modelos de documentos
            </p>
          </div>

          <Button
            onClick={() => navigate("/criar-template")}
            size={isMobile ? "default" : "lg"}
            className={isMobile ? "w-full" : ""}
          >
            <Plus className="h-5 w-5 mr-2" />
            Novo Template
          </Button>
        </div>

        {/* Grid de templates */}
        <div
          className={`
            grid gap-4 md:gap-6 
            ${isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3"}
          `}
        >
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              {...template}
              onFill={handleFill}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {/* Estado vazio */}
        {templates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Nenhum template cadastrado ainda
            </p>
            <Button
              onClick={() => navigate("/criar-template")}
              className={isMobile ? "w-full" : ""}
            >
              Criar primeiro template
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Index;
