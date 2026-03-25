import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { TemplateCard } from "@/components/TemplateCard";
import { Button } from "@/components/ui/button";
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
import { Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { templateService, Template } from "@/services/templateService";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await templateService.listTemplates();
      console.log("DATA:", data);
      setTemplates(data);
    } catch (error) {
      console.error("ERRO AO CARREGAR:", error);
      toast({
        title: "Erro ao carregar templates",
        description: "Não foi possível carregar os templates da API.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFill = (id: string) => {
    navigate(`/preencher/${id}`);
  };

  const handleDeleteClick = (id: string) => {
    setTemplateToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!templateToDelete) return;

    try {
      await templateService.deleteTemplate(templateToDelete);
      setTemplates((prev) => prev.filter((t) => t.id !== templateToDelete));
      toast({
        title: "Template excluído",
        description: "O template foi removido com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao excluir template:", error);
      toast({
        title: "Erro ao excluir template",
        description: "Não foi possível excluir o template. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setTemplateToDelete(null);
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
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
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
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}

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

      {/* Confirmation Dialog for Delete */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este template? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Index;
