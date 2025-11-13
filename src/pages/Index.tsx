import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { TemplateCard } from "@/components/TemplateCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
    setTemplates(templates.filter((t) => t.id !== id));
    toast({
      title: "Template excluído",
      description: "O template foi removido com sucesso.",
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Templates disponíveis
            </h1>
            <p className="text-muted-foreground">
              Gerencie e preencha seus modelos de documentos
            </p>
          </div>
          <Button onClick={() => navigate("/criar-template")} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Novo Template
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              {...template}
              onFill={handleFill}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {templates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Nenhum template cadastrado ainda
            </p>
            <Button onClick={() => navigate("/criar-template")}>
              Criar primeiro template
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Index;
